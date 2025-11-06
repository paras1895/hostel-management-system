// pages/api/complaints.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { parse } from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const cookiesObj = req.headers.cookie ? parse(req.headers.cookie) : {};
  const userIdRaw = cookiesObj.token;
  if (!userIdRaw) return res.status(401).json({ message: "Not logged in" });

  try {
    const rows = await prisma.$queryRaw<{ studentId: number | bigint | null }[]>`
      SELECT studentId FROM User WHERE id = ${Number(userIdRaw)} LIMIT 1
    `;
    const studentIdVal = rows[0]?.studentId;
    if (!studentIdVal) return res.status(404).json({ message: "Student not found" });
    const studentId = Number(studentIdVal);

    if (req.method === "GET") {
      const complaints = await prisma.$queryRaw<any[]>`
        SELECT
          id,
          studentId,
          message,
          status,
          createdAt,
          updatedAt
        FROM Complaint
        WHERE studentId = ${studentId}
        ORDER BY createdAt ASC
      `;
      const safe = JSON.parse(JSON.stringify(complaints, (_k, v) => (typeof v === "bigint" ? Number(v) : v)));
      return res.status(200).json(safe);
    }

    if (req.method === "POST") {
      const { message } = req.body ?? {};
      if (!message || String(message).trim() === "") {
        return res.status(400).json({ message: "Complaint message cannot be empty" });
      }

      await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`
          INSERT INTO Complaint (studentId, message, status, createdAt, updatedAt)
          VALUES (${studentId}, ${message}, ${"Pending"}, NOW(), NOW())
        `;
        const rid = await tx.$queryRaw<{ id: number | bigint }[]>`
          SELECT CAST(LAST_INSERT_ID() AS UNSIGNED) AS id
        `;
        const insertedId = Number(rid[0].id);
        const row = await tx.$queryRaw<any[]>`
          SELECT
            id,
            studentId,
            message,
            status,
            createdAt,
            updatedAt
          FROM Complaint
          WHERE id = ${insertedId}
          LIMIT 1
        `;
        const safe = JSON.parse(JSON.stringify(row[0] ?? {}, (_k, v) => (typeof v === "bigint" ? Number(v) : v)));
        res.status(201).json(safe);
      });
    }
  } catch (err) {
    console.error("Complaint API error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}