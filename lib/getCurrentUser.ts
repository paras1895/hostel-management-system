import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

type UserRow = {
  id: number;
  email: string;
  password: string;
  role: string;
  studentId: number | null;
  wardenId: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const userId = Number(token);
  if (!Number.isFinite(userId)) return null;

  const users = await prisma.$queryRaw<UserRow[]>`
    SELECT id, email, password, role, studentId, wardenId, createdAt, updatedAt
    FROM User
    WHERE id = ${userId}
    LIMIT 1
  `;
  const user = users[0];
  if (!user) return null;

  const result: any = { ...user, student: null, warden: null };

  if (user.studentId) {
    const [student] = await prisma.$queryRaw<any[]>`
      SELECT id, mis, name, email, year, gender, cgpa, preference, roomId, messId, verified, createdAt, updatedAt
      FROM Student
      WHERE id = ${user.studentId}
      LIMIT 1
    `;

    if (student) {
      const studentOut: any = {
        ...student,
        room: null,
        mess: null,
        payments: [],
        complaints: [],
      };

      if (student.roomId) {
        const [room] = await prisma.$queryRaw<any[]>`
          SELECT id, roomNumber, capacity, blockId, groupGender, groupYear
          FROM Room
          WHERE id = ${student.roomId}
          LIMIT 1
        `;

        if (room) {
          const [block] = await prisma.$queryRaw<any[]>`
            SELECT id, name
            FROM Block
            WHERE id = ${room.blockId}
            LIMIT 1
          `;

          const wardens = block
            ? await prisma.$queryRaw<any[]>`
                SELECT id, name, email, phone, blockId
                FROM Warden
                WHERE blockId = ${block.id}
              `
            : [];

          const roommates = await prisma.$queryRaw<any[]>`
            SELECT id, name, email, cgpa, year
            FROM Student
            WHERE roomId = ${room.id}
          `;

          studentOut.room = {
            ...room,
            block: block ? { ...block, warden: wardens } : null,
            students: roommates,
          };
        }
      }

      if (student.messId) {
        const [mess] = await prisma.$queryRaw<any[]>`
          SELECT id, name, capacity, menu
          FROM Mess
          WHERE id = ${student.messId}
          LIMIT 1
        `;
        studentOut.mess = mess ?? null;
      }

      const payments = await prisma.$queryRaw<any[]>`
        SELECT id, studentId, amount, status, dueDate, paidAt, createdAt, updatedAt
        FROM Payment
        WHERE studentId = ${student.id}
        ORDER BY createdAt DESC
      `;
      studentOut.payments = payments;

      const complaints = await prisma.$queryRaw<any[]>`
        SELECT id, studentId, message, status, createdAt, updatedAt
        FROM Complaint
        WHERE studentId = ${student.id}
        ORDER BY createdAt DESC
      `;
      studentOut.complaints = complaints;

      result.student = studentOut;
    }
  }

  if (user.wardenId) {
    const [warden] = await prisma.$queryRaw<any[]>`
      SELECT id, name, email, phone, blockId
      FROM Warden
      WHERE id = ${user.wardenId}
      LIMIT 1
    `;

    if (warden) {
      let blockOut: any = null;

      if (warden.blockId) {
        const [block] = await prisma.$queryRaw<any[]>`
          SELECT id, name
          FROM Block
          WHERE id = ${warden.blockId}
          LIMIT 1
        `;

        if (block) {
          const rooms = await prisma.$queryRaw<any[]>`
            SELECT id, roomNumber, capacity, blockId, groupGender, groupYear
            FROM Room
            WHERE blockId = ${block.id}
            ORDER BY roomNumber ASC
          `;
          blockOut = { ...block, rooms };
        }
      }

      result.warden = { ...warden, block: blockOut };
    }
  }

  return result;
}
