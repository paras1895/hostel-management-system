// pages/api/room/card.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "../_utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const user = await getUserFromRequest(req);
  if (!user?.student) return res.status(401).json({ error: "Unauthorized" });

  const me = await prisma.student.findUnique({
    where: { id: user.student.id },
    select: { id: true, roomId: true },
  });

  if (!me?.roomId) {
    return res.status(200).json({ room: null, pending: [] });
  }

  const room = await prisma.room.findUnique({
    where: { id: me.roomId },
    select: {
      id: true,
      roomNumber: true,
      capacity: true,
      block: { select: { name: true } },
      students: { select: { id: true, name: true, mis: true } },
      _count: { select: { students: true } },
    },
  });

  if (!room) return res.status(200).json({ room: null, pending: [] });

  const pendingInvites = await prisma.roomInvite.findMany({
    where: { roomId: room.id, status: "PENDING" },
    select: { toStudent: { select: { id: true, name: true, mis: true } } },
    orderBy: { id: "desc" },
  });

  return res.status(200).json({
    room: {
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      blockName: room.block?.name ?? null,
      count: room._count.students,
      students: room.students,
    },
    pending: pendingInvites.map((i) => i.toStudent),
  });
}
