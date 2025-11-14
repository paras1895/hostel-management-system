import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "../_utils";

async function ensureProvisionalBlock() {
  let block = await prisma.block.findFirst({ where: { name: "Provisional" } });
  if (!block) {
    block = await prisma.block.create({ data: { name: "Provisional" } });
  }
  return block;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const user = await getUserFromRequest(req);
  if (!user?.student) return res.status(401).json({ error: "Unauthorized" });

  const me = await prisma.student.findUnique({
    where: { id: user.student.id },
    include: { room: { include: { _count: { select: { students: true } } } } },
  });

  if (me?.room) {
    return res.status(200).json({ ok: true, roomId: me.room.id });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const block = await ensureProvisionalBlock();

      const room = await tx.room.create({
        data: {
          roomNumber: "TEMP-" + Math.floor(100000 + Math.random() * 900000),
          capacity: 4,
          blockId: block.id,
        },
      });

      await tx.student.update({
        where: { id: user.student!.id },
        data: { roomId: room.id },
      });

      return room.id;
    });

    return res.status(200).json({ ok: true, roomId: result });
  } catch (e: any) {
    return res
      .status(400)
      .json({ error: e.message ?? "Failed to request room" });
  }
}
