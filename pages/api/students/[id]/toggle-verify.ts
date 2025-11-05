import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "../../_utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const user = await getUserFromRequest(req);
  if (!user?.warden) return res.status(401).json({ error: "Unauthorized" });

  const studentId = Number(req.query.id);
  if (!studentId) return res.status(400).json({ error: "Missing student ID" });

  const [student] = await prisma.$queryRaw<any[]>`
    SELECT verified FROM Student WHERE id = ${studentId} LIMIT 1
  `;

  const newStatus = !student?.verified;

  await prisma.$executeRaw`
    UPDATE Student SET verified = ${newStatus} WHERE id = ${studentId}
  `;

  return res.status(200).redirect(`/warden/students/${studentId}`);
}
