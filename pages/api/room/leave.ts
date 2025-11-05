// pages/api/room/leave.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "../_utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const user = await getUserFromRequest(req);
  if (!user?.student) return res.status(401).json({ error: "Unauthorized" });

  // get the room we’re leaving so we can target only those invites
  const me = await prisma.student.findUnique({
    where: { id: user.student.id },
    select: { roomId: true },
  });

  if (!me?.roomId) return res.status(200).json({ ok: true }); // nothing to do

  await prisma.$transaction(async (tx) => {
    const prevRoomId = me.roomId!;

    // leave the room
    await tx.student.update({
      where: { id: user.student!.id },
      data: { roomId: null },
    });

    // EXPIRE invites that are no longer valid:

    // 1) invites they RECEIVED to the room they just left
    await tx.roomInvite.updateMany({
      where: { toStudentId: user.student!.id, status: "PENDING", roomId: prevRoomId },
      data: { status: "EXPIRED", respondedAt: new Date() },
    });

    // 2) invites they SENT while in that room (their old room cannot use them now)
    await tx.roomInvite.updateMany({
      where: { fromStudentId: user.student!.id, status: "PENDING", roomId: prevRoomId },
      data: { status: "EXPIRED", respondedAt: new Date() },
    });
  });

  return res.status(200).json({ ok: true });
}
