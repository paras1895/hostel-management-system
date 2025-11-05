// pages/api/student/update.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "../_utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") return res.status(405).end();

  const user = await getUserFromRequest(req);
  if (!user?.student) {
    return res.status(401).json({ error: "Unauthorized student" });
  }

  const { name, email, gender, cgpa, preference } = req.body;

  try {
    // Update Student AND User email for consistency
    await prisma.$transaction([
      prisma.student.update({
        where: { id: user.student.id },
        data: { name, gender, cgpa, preference },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { email },
      }),
    ]);

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
