// pages/api/complaints/resolve.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "../_utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const user = await getUserFromRequest(req);
  if (!user?.warden) {
    return res.status(401).json({ error: "Unauthorized. Warden access required." });
  }

  const { complaintId } = req.body;
  if (!complaintId) {
    return res.status(400).json({ error: "Missing complaintId" });
  }

  try {
    await prisma.$executeRaw`
      UPDATE Complaint
      SET status = 'Resolved', updatedAt = NOW()
      WHERE id = ${Number(complaintId)}
    `;
    return res.redirect(`/warden/students/${req.headers.referer?.split("/").pop()}`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to resolve complaint" });
  }
}