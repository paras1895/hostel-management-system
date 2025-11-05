// pages/api/_utils.ts
import type { NextApiRequest } from "next";
import { prisma } from "@/lib/prisma";

export async function getUserFromRequest(req: NextApiRequest) {
  const token = req.cookies?.token;
  if (!token) return null;

  const user = await prisma.user.findUnique({
    where: { id: Number(token) },
    include: {
      student: true,
      warden: true,
    },
  });
  return user;
}
