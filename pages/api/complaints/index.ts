import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { parse } from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET and POST
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Extract token (userId) from cookies
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const userId = cookies.token;

  if (!userId) {
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
    // Find user and their student profile
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: { student: true },
    });

    if (!user || !user.student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentId = user.student.id;

    // GET - Fetch all complaints for this student
    if (req.method === "GET") {
      const complaints = await prisma.complaint.findMany({
        where: { studentId },
        orderBy: { createdAt: "asc" },
      });

      return res.status(200).json(complaints);
    }

    // POST - Create new complaint
    if (req.method === "POST") {
      const { message } = req.body;

      if (!message || message.trim() === "") {
        return res.status(400).json({ message: "Complaint message cannot be empty" });
      }

      const complaint = await prisma.complaint.create({
        data: {
          studentId,
          message,
        },
      });

      return res.status(201).json(complaint);
    }
  } catch (err) {
    console.error("Complaint API error:", err);
    return res.status(500).json({ message: "Server error", error: err });
  }
}