// lib/roomCard.ts
import { prisma } from "@/lib/prisma";

export async function getRoomCardData(studentId: number) {
  return await prisma.$transaction(async (tx) => {
    const meRows = await tx.$queryRaw<{ roomId: number | bigint | null }[]>`
      SELECT roomId FROM Student WHERE id = ${studentId} LIMIT 1
    `;
    const me = meRows[0];
    if (!me?.roomId) return null;
    const roomId = Number(me.roomId);

    const roomRows = await tx.$queryRaw<{
      id: number | bigint;
      roomNumber: string;
      capacity: number | bigint;
      blockName: string | null;
      count: number | bigint;
    }[]>`
      SELECT
        r.id,
        r.roomNumber,
        r.capacity,
        b.name AS blockName,
        (SELECT COUNT(*) FROM Student s2 WHERE s2.roomId = r.id) AS count
      FROM Room r
      LEFT JOIN Block b ON b.id = r.blockId
      WHERE r.id = ${roomId}
      LIMIT 1
    `;
    if (roomRows.length === 0) return null;

    const students = await tx.$queryRaw<{ id: number | bigint; name: string; mis: number | bigint }[]>`
      SELECT CAST(id AS UNSIGNED) AS id, name, CAST(mis AS UNSIGNED) AS mis
      FROM Student
      WHERE roomId = ${roomId}
      ORDER BY id ASC
    `;

    const pending = await tx.$queryRaw<{ id: number | bigint; toId: number | bigint; name: string; mis: number | bigint }[]>`
      SELECT
        ri.id,
        s.id  AS toId,
        s.name,
        s.mis
      FROM RoomInvite ri
      JOIN Student s ON s.id = ri.toStudentId
      WHERE ri.roomId = ${roomId} AND ri.status = 'PENDING'
      ORDER BY ri.createdAt DESC
    `;

    const roomRow = roomRows[0];

    return {
      room: {
        roomNumber: roomRow.roomNumber,
        capacity: Number(roomRow.capacity),
        blockName: roomRow.blockName ?? null,
        count: Number(roomRow.count),
        students: students.map((s) => ({
          id: Number(s.id),
          name: s.name,
          mis: Number(s.mis),
        })),
      },
      pending: pending.map((p) => ({
        id: Number(p.toId),
        name: p.name,
        mis: Number(p.mis),
      })),
    };
  });
}