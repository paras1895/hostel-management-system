// lib/roommates.ts
import { prisma } from "@/lib/prisma";

export async function getMyRoomAndMembers(studentId: number) {
  // 1) Find my room (or null)
  const base = await prisma.$queryRaw<
    { roomId: number | null; roomNumber: string | null; capacity: number | null }[]
  >`
    SELECT r.id AS roomId, r.roomNumber, r.capacity
    FROM Student s
    LEFT JOIN Room r ON r.id = s.roomId
    WHERE s.id = ${studentId}
    LIMIT 1
  `;

  const row = base[0];
  if (!row || row.roomId == null) {
    // keep shape identical to old code: me?.room === null
    return { room: null };
  }

  // 2) Count current students in my room
  const cntRows = await prisma.$queryRaw<{ cnt: number }[]>`
    SELECT COUNT(*) AS cnt FROM Student WHERE roomId = ${row.roomId}
  `;
  const count = Number(cntRows[0]?.cnt ?? 0);

  // 3) Load members (fields your UI reads)
  const students = await prisma.$queryRaw<
    { id: number; name: string; email: string; cgpa: number; year: string }[]
  >`
    SELECT id, name, email, cgpa, year
    FROM Student
    WHERE roomId = ${row.roomId}
    ORDER BY name
  `;

  // 4) Return the nested shape your page expects
  return {
    room: {
      id: row.roomId,
      roomNumber: row.roomNumber,
      capacity: row.capacity,
      _count: { students: count },
      students,
    },
  };
}

export async function getAvailableStudentsForInvite(myStudentId: number) {
  const [me] = await prisma.$queryRawUnsafe(`
    SELECT
      s.id, s.gender, s.year,
      r.id AS roomId, r.capacity AS roomCapacity, r.groupGender, r.groupYear
    FROM Student s
    LEFT JOIN Room r ON s.roomId = r.id
    WHERE s.id = ${myStudentId}
  `);

  if (!me) return [];

  const lockGender = me.groupGender || me.gender || null;
  const lockYear = me.groupYear || me.year || null;

  const candidates = await prisma.$queryRawUnsafe(`
    SELECT
      s.id,
      s.name,
      s.email,
      s.gender,
      s.year,
      r.id AS roomId,
      r.capacity AS roomCapacity,
      (SELECT COUNT(*) FROM Student WHERE roomId = r.id) AS roomSize
    FROM Student s
    LEFT JOIN Room r ON s.roomId = r.id
    WHERE
      s.id != ${myStudentId}
      ${lockGender ? `AND s.gender = '${lockGender}'` : ""}
      ${lockYear ? `AND s.year = '${lockYear}'` : ""}
    HAVING
      (roomId IS NULL OR roomSize < roomCapacity)
      AND (roomId IS NULL OR roomId != ${me.roomId || -1})
    LIMIT 200;
  `);

  return candidates;
}

export async function getMyInvites(studentId: number) {
  return prisma.$queryRawUnsafe(`
    SELECT
      ri.id AS inviteId,
      ri.createdAt AS inviteDate,
      fs.id AS fromStudentId,
      fs.name AS fromStudentName,
      fs.year AS fromStudentYear,
      fs.cgpa AS fromStudentCgpa,
      r.id AS roomId,
      r.roomNumber,
      r.capacity,
      (SELECT COUNT(*) FROM Student WHERE roomId = r.id) AS currentOccupancy,
      b.name AS blockName
    FROM RoomInvite ri
    JOIN Student fs ON ri.fromStudentId = fs.id
    JOIN Room r ON ri.roomId = r.id
    JOIN Block b ON r.blockId = b.id
    WHERE
      ri.toStudentId = ${studentId}
      AND ri.status = 'PENDING'
    ORDER BY ri.createdAt DESC;
  `);
}
