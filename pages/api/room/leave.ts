import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "../_utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const user = await getUserFromRequest(req);
  if (!user?.student) return res.status(401).json({ error: "Unauthorized" });

  const me = await prisma.student.findUnique({
    where: { id: user.student.id },
    select: { roomId: true },
  });

  if (!me?.roomId) return res.status(200).json({ ok: true });

  await prisma.$transaction(async (tx) => {
    const prevRoomId = me.roomId!;

    await tx.student.update({
      where: { id: user.student!.id },
      data: { roomId: null },
    });

    await tx.roomInvite.updateMany({
      where: {
        toStudentId: user.student!.id,
        status: "PENDING",
        roomId: prevRoomId,
      },
      data: { status: "EXPIRED", respondedAt: new Date() },
    });

    await tx.roomInvite.updateMany({
      where: {
        fromStudentId: user.student!.id,
        status: "PENDING",
        roomId: prevRoomId,
      },
      data: { status: "EXPIRED", respondedAt: new Date() },
    });
  });

  return res.status(200).json({ ok: true });
}
