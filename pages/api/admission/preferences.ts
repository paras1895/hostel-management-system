// pages/api/admission/preferences.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "../_utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const user = await getUserFromRequest(req);
  if (!user?.student?.id) return res.status(401).json({ error: "Unauthorized" });

  const { preferences } = (req.body ?? {}) as { preferences?: string[] };
  if (!Array.isArray(preferences) || preferences.length === 0) {
    return res.status(400).json({ error: "preferences must be a non-empty string array" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Load my provisional room
      const meRows = await tx.$queryRaw<{ roomId: number | null }[]>`
        SELECT roomId FROM Student WHERE id = ${user.student.id} LIMIT 1
      `;
      const myRoomId = meRows[0]?.roomId ?? null;
      if (!myRoomId) throw new Error("You are not in a provisional room.");

      // Room number + block to verify TEMP/Provisional
      const roomRows = await tx.$queryRaw<{ id: number; roomNumber: string; blockName: string }[]>`
        SELECT r.id, r.roomNumber, b.name AS blockName
        FROM Room r JOIN Block b ON b.id = r.blockId
        WHERE r.id = ${myRoomId}
        LIMIT 1
      `;
      const room = roomRows[0];
      if (!room) throw new Error("Room not found.");
      // Treat either Block='Provisional' OR roomNumber like 'TEMP-%' as provisional
      if (room.blockName !== "Provisional" && !room.roomNumber.startsWith("TEMP-")) {
        throw new Error("Preferences can be submitted only from a provisional room.");
      }

      // Delete previous preferences for this provisional room
      await tx.$executeRaw`
        DELETE FROM RoomPreference WHERE provisionalRoomId = ${room.id}
      `;

      // Convert labels (e.g., "C-203") to desiredRoomId
      // Ignore duplicates / invalid codes silently
      let rank = 1;
      for (const label of preferences) {
        if (typeof label !== "string") continue;

        const rows = await tx.$queryRaw<{ id: number }[]>`
          SELECT id FROM Room WHERE roomNumber = ${label} LIMIT 1
        `;
        if (!rows.length) continue;

        await tx.$executeRaw`
          INSERT INTO RoomPreference (provisionalRoomId, rankNo, desiredRoomId)
          VALUES (${room.id}, ${rank}, ${rows[0].id})
        `;
        rank += 1;
      }
      if (rank === 1) throw new Error("No valid rooms in preferences.");

      return { ok: true, provisionalRoomId: room.id, count: rank - 1 };
    });

    return res.status(200).json(result);
  } catch (e: any) {
    console.error(e);
    return res.status(400).json({ error: e?.message ?? "Failed" });
  }
}
