import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "../_utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const user = await getUserFromRequest(req);
  if (!user?.warden) return res.status(401).json({ error: "Unauthorized" });

  const { studentId } = req.body;

  try {
    await prisma.$executeRaw`
      UPDATE Student SET verified = TRUE WHERE id = ${Number(studentId)}
    `;
    return res.redirect(`/warden/students/${studentId}`);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
