// pages/api/invites/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "../_utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const user = await getUserFromRequest(req);
  if (!user?.student?.id) return res.status(401).json({ error: "Unauthorized" });

  const { toStudentId } = (req.body ?? {}) as { toStudentId?: number };
  if (!toStudentId) return res.status(400).json({ error: "toStudentId required" });

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Ensure Provisional block inside this same connection
      let block = await tx.$queryRaw<{ id: number }[]>`
        SELECT id FROM Block WHERE name = ${"Provisional"} LIMIT 1
      `;
      let blockId: number;
      if (block.length === 0) {
        await tx.$executeRaw`
          INSERT INTO Block (name) VALUES (${"Provisional"})
        `;
        const newId = await tx.$queryRaw<{ id: number }[]>`
          SELECT LAST_INSERT_ID() AS id
        `;
        blockId = newId[0].id;
      } else {
        blockId = block[0].id;
      }

      // Load inviter with current room/locks
      const inviterRows = await tx.$queryRaw<{
        studentId: number;
        myGender: string;
        myYear: string;
        myRoomId: number | null;
      }[]>`
        SELECT 
          s.id AS studentId,
          s.gender AS myGender,
          s.year AS myYear,
          s.roomId AS myRoomId
        FROM Student s
        WHERE s.id = ${user.student.id}
        LIMIT 1
      `;
      const inviter = inviterRows[0];
      if (!inviter) throw new Error("Inviter not found");

      let roomId = inviter.myRoomId;

      // If no room, create a provisional one (in this same tx)
      if (!roomId) {
        const tempRoomNumber = "TEMP-" + Math.floor(100000 + Math.random() * 900000);
        await tx.$executeRaw`
          INSERT INTO Room (roomNumber, capacity, blockId, groupGender, groupYear)
          VALUES (${tempRoomNumber}, ${4}, ${blockId}, ${inviter.myGender}, ${inviter.myYear})
        `;
        const rid = await tx.$queryRaw<{ id: number }[]>`
          SELECT LAST_INSERT_ID() AS id
        `;
        roomId = rid[0].id;

        await tx.$executeRaw`
          UPDATE Student SET roomId = ${roomId} WHERE id = ${user.student.id}
        `;
      }

      // Reload current room snapshot
      const roomRows = await tx.$queryRaw<{
        id: number; capacity: number; groupGender: string | null; groupYear: string | null; studentCount: number;
      }[]>`
        SELECT 
          r.id,
          r.capacity,
          r.groupGender,
          r.groupYear,
          (SELECT COUNT(*) FROM Student WHERE roomId = r.id) AS studentCount
        FROM Room r
        WHERE r.id = ${roomId!}
        LIMIT 1
      `;
      const myRoom = roomRows[0];
      if (!myRoom) throw new Error("Room not found");
      if (myRoom.studentCount >= myRoom.capacity) throw new Error("Your room is already full.");

      // Target student
      const targetRows = await tx.$queryRaw<{ id: number; roomId: number | null; gender: string; year: string }[]>`
        SELECT id, roomId, gender, year
        FROM Student
        WHERE id = ${toStudentId}
        LIMIT 1
      `;
      const target = targetRows[0];
      if (!target) throw new Error("Target student not found");
      if (target.roomId === myRoom.id) throw new Error("This student is already in your room.");

      if (myRoom.groupGender && target.gender && target.gender !== myRoom.groupGender) {
        throw new Error("Only same-gender roommates can be invited to this room.");
      }
      if (myRoom.groupYear && target.year && target.year !== myRoom.groupYear) {
        throw new Error("Only same-year roommates can join this room.");
      }

      // Prevent/handle duplicate pending (race-proof)
      const existing = await tx.$queryRaw<{ id: number }[]>`
        SELECT id FROM RoomInvite
        WHERE toStudentId = ${toStudentId} AND roomId = ${myRoom.id} AND status = 'PENDING'
        LIMIT 1
      `;
      if (existing.length) {
        return { ok: true as const, id: existing[0].id, alreadyExisted: true as const };
      }

      // Create invite; IGNORE avoids 1062 on race
      await tx.$executeRawUnsafe(`
        INSERT IGNORE INTO RoomInvite (fromStudentId, toStudentId, roomId, status, createdAt)
        VALUES (${user.student.id}, ${toStudentId}, ${myRoom.id}, 'PENDING', NOW())
      `);

      // Read back the pending invite deterministically
      const created = await tx.$queryRaw<{ id: number }[]>`
        SELECT id FROM RoomInvite
        WHERE fromStudentId = ${user.student.id}
          AND toStudentId = ${toStudentId}
          AND roomId = ${myRoom.id}
          AND status = 'PENDING'
        ORDER BY id DESC
        LIMIT 1
      `;
      if (created.length === 0) throw new Error("Failed to create invite.");

      return { ok: true as const, id: created[0].id };
    });

    return res.status(200).json(result);
  } catch (e: any) {
    console.error(e);
    return res.status(400).json({ error: e?.message ?? "Failed" });
  }
}