// pages/api/room/card.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "../_utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const user = await getUserFromRequest(req);
  if (!user?.student) return res.status(401).json({ error: "Unauthorized" });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const meRows = await tx.$queryRaw<{ roomId: number | bigint | null }[]>`
        SELECT roomId FROM Student WHERE id = ${user.student.id} LIMIT 1
      `;
      const me = meRows[0];
      if (!me?.roomId) {
        return { room: null as const, pending: [] as any[] };
      }
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
      if (roomRows.length === 0) {
        return { room: null as const, pending: [] as any[] };
      }
      const roomRow = roomRows[0];

      const students = await tx.$queryRaw<{ id: number | bigint; name: string; mis: number | bigint }[]>`
        SELECT id, name, mis
        FROM Student
        WHERE roomId = ${roomId}
        ORDER BY id ASC
      `;

      const pending = await tx.$queryRaw<{ id: number | bigint; name: string; mis: number | bigint }[]>`
        SELECT
        id,
        name,
        mis
        FROM RoomInvite ri
        JOIN Student s ON s.id = ri.toStudentId
        WHERE ri.roomId = ${roomId} AND ri.status = 'PENDING'
        ORDER BY ri.id DESC
      `;

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
          id: Number(p.id),
          name: p.name,
          mis: Number(p.mis),
        })),
      };
    });

    return res.status(200).json(result);
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message ?? "Failed" });
  }
}