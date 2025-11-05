// pages/api/admission/seed-rooms.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    await prisma.$transaction(async (tx) => {
      // create blocks A/B/C if missing
      const need = async (name: string) => {
        const r = await tx.$queryRaw<{ id: number }[]>`
          SELECT id FROM Block WHERE name = ${name} LIMIT 1
        `;
        if (r.length) return r[0].id;
        await tx.$executeRaw`INSERT INTO Block (name) VALUES (${name})`;
        const id = await tx.$queryRaw<{ id: number }[]>`SELECT LAST_INSERT_ID() AS id`;
        return id[0].id;
      };

      const blockA = await need("A");
      const blockB = await need("B");
      const blockC = await need("C");

      // helper to insert a room if missing
      const ensureRoom = async (blockId: number, roomNumber: string) => {
        await tx.$executeRaw`
          INSERT IGNORE INTO Room (roomNumber, capacity, blockId)
          VALUES (${roomNumber}, ${4}, ${blockId})
        `;
      };

      const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

      // A-101..A-150, B-101..B-150, C-101..C-150 (50 rooms each)
      for (const n of range(101, 150)) await ensureRoom(blockA, `A-${n}`);
      for (const n of range(101, 150)) await ensureRoom(blockB, `B-${n}`);
      for (const n of range(101, 150)) await ensureRoom(blockC, `C-${n}`);
    });

    return res.status(200).json({ ok: true, message: "Blocks A/B/C and rooms seeded" });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e?.message ?? "Failed" });
  }
}
