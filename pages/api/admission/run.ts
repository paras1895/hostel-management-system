// pages/api/admission/run.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const summary = await prisma.$transaction(async (tx) => {
      // 1) Collect provisional rooms that HAVE preferences + their group size + avg CGPA
      const provisional = await tx.$queryRaw<
        {
          provisionalRoomId: number;
          roomNumber: string;
          groupSize: number;
          avgCgpa: number;
        }[]
      >`
        SELECT
          r.id AS provisionalRoomId,
          r.roomNumber,
          COUNT(s.id)        AS groupSize,
          AVG(s.cgpa)        AS avgCgpa
        FROM RoomPreference rp
        JOIN Room r   ON r.id = rp.provisionalRoomId
        JOIN Block b  ON b.id = r.blockId
        JOIN Student s ON s.roomId = r.id
        WHERE b.name = 'Provisional' OR r.roomNumber LIKE 'TEMP-%'
        GROUP BY r.id
        ORDER BY avgCgpa DESC, r.id ASC
      `;

      // 2) Preload current occupancy for all real rooms (non-provisional)
      const realRooms = await tx.$queryRaw<
        { id: number; roomNumber: string; capacity: number; occupied: number }[]
      >`
        SELECT
          r.id,
          r.roomNumber,
          r.capacity,
          (SELECT COUNT(*) FROM Student s WHERE s.roomId = r.id) AS occupied
        FROM Room r
        JOIN Block b ON b.id = r.blockId
        WHERE b.name <> 'Provisional' AND r.roomNumber NOT LIKE 'TEMP-%'
        ORDER BY r.id
      `;

      const availableMap = new Map<number, { roomNumber: string; capacity: number; occupied: number }>();
      for (const r of realRooms) availableMap.set(r.id, { roomNumber: r.roomNumber, capacity: r.capacity, occupied: r.occupied });

      const taken = new Set<number>(); // rooms allocated in this run
      const results: Array<{
        provisionalRoomId: number;
        avgCgpa: number;
        groupSize: number;
        chosenRoomId?: number;
        chosenRoomNumber?: string;
        reason?: string;
      }> = [];

      // 3) Iterate by avg CGPA, try to place each group
      for (const p of provisional) {
        // Read ranked preferences
        const prefs = await tx.$queryRaw<{ desiredRoomId: number; rankNo: number }[]>`
          SELECT desiredRoomId, rankNo
          FROM RoomPreference
          WHERE provisionalRoomId = ${p.provisionalRoomId}
          ORDER BY rankNo ASC
        `;

        let placed: { roomId: number; roomNumber: string } | null = null;

        for (const pr of prefs) {
          const avail = availableMap.get(pr.desiredRoomId);
          if (!avail) continue;
          if (taken.has(pr.desiredRoomId)) continue;                      // already assigned this run
          if (avail.occupied + p.groupSize > avail.capacity) continue;    // not enough space

          // Place entire group here
          await tx.$executeRaw`
            UPDATE Student
            SET roomId = ${pr.desiredRoomId}
            WHERE roomId = ${p.provisionalRoomId}
          `;

          // Update in-memory occupancy and mark taken (optional: allow multiple groups if capacity allows; here we lock to single-group per room)
          avail.occupied += p.groupSize;
          taken.add(pr.desiredRoomId);

          placed = { roomId: pr.desiredRoomId, roomNumber: avail.roomNumber };

          // Optional: clear preferences for this provisional room
          await tx.$executeRaw`DELETE FROM RoomPreference WHERE provisionalRoomId = ${p.provisionalRoomId}`;
          break;
        }

        if (placed) {
          results.push({
            provisionalRoomId: p.provisionalRoomId,
            avgCgpa: Number(p.avgCgpa),
            groupSize: Number(p.groupSize),
            chosenRoomId: placed.roomId,
            chosenRoomNumber: placed.roomNumber,
          });
        } else {
          results.push({
            provisionalRoomId: p.provisionalRoomId,
            avgCgpa: Number(p.avgCgpa),
            groupSize: Number(p.groupSize),
            reason: "No preferred rooms available with enough capacity",
          });
        }
      }

      return { ok: true as const, results };
    });

    return res.status(200).json(summary);
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e?.message ?? "Failed" });
  }
}