// lib/currentUser.raw.ts
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Shapes are minimal; extend if you want stricter typing
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

  // 1) Base user
  const users = await prisma.$queryRaw<UserRow[]>`
    SELECT id, email, password, role, studentId, wardenId, createdAt, updatedAt
    FROM User
    WHERE id = ${userId}
    LIMIT 1
  `;
  const user = users[0];
  if (!user) return null;

  // Build the return object incrementally
  const result: any = { ...user, student: null, warden: null };

  // If the user is linked to a student, fetch that graph
  if (user.studentId) {
    // 2) Student
    const [student] = await prisma.$queryRaw<any[]>`
      SELECT id, mis, name, email, year, gender, cgpa, preference, roomId, messId, verified, createdAt, updatedAt
      FROM Student
      WHERE id = ${user.studentId}
      LIMIT 1
    `;

    if (student) {
      const studentOut: any = { ...student, room: null, mess: null, payments: [], complaints: [] };

      // 3) Room + Block + Warden[]
      if (student.roomId) {
        // Room
        const [room] = await prisma.$queryRaw<any[]>`
          SELECT id, roomNumber, capacity, blockId, groupGender, groupYear
          FROM Room
          WHERE id = ${student.roomId}
          LIMIT 1
        `;

        if (room) {
          // Block
          const [block] = await prisma.$queryRaw<any[]>`
            SELECT id, name
            FROM Block
            WHERE id = ${room.blockId}
            LIMIT 1
          `;

          // Warden[] for the block
          const wardens = block
            ? await prisma.$queryRaw<any[]>`
                SELECT id, name, email, phone, blockId
                FROM Warden
                WHERE blockId = ${block.id}
              `
            : [];

          // Students in the same room (limited fields)
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

      // 4) Mess (if any)
      if (student.messId) {
        const [mess] = await prisma.$queryRaw<any[]>`
          SELECT id, name, capacity, menu
          FROM Mess
          WHERE id = ${student.messId}
          LIMIT 1
        `;
        studentOut.mess = mess ?? null;
      }

      // 5) Payments
      const payments = await prisma.$queryRaw<any[]>`
        SELECT id, studentId, amount, status, dueDate, paidAt, createdAt, updatedAt
        FROM Payment
        WHERE studentId = ${student.id}
        ORDER BY createdAt DESC
      `;
      studentOut.payments = payments;

      // 6) Complaints
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

  // If the user is linked to a warden, fetch that graph
  if (user.wardenId) {
    // 7) Warden
    const [warden] = await prisma.$queryRaw<any[]>`
      SELECT id, name, email, phone, blockId
      FROM Warden
      WHERE id = ${user.wardenId}
      LIMIT 1
    `;

    if (warden) {
      let blockOut: any = null;

      if (warden.blockId) {
        // Block
        const [block] = await prisma.$queryRaw<any[]>`
          SELECT id, name
          FROM Block
          WHERE id = ${warden.blockId}
          LIMIT 1
        `;

        if (block) {
          // Rooms in that block
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