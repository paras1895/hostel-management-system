// pages/api/signup.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const YEAR_VALUES = new Set(["FY", "SY", "TY", "BE"]);
const GENDER_VALUES = new Set(["MALE", "FEMALE", "OTHER"]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ code: "method_not_allowed", message: "Method Not Allowed" });
  }

  try {
    const { name, mis, year, gender, email, password, cgpa, preference } = req.body ?? {};

    // basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ code: "missing_fields", message: "Missing required fields" });
    }

    if (!YEAR_VALUES.has(year)) {
      return res.status(400).json({ code: "invalid_year", message: "Invalid year value" });
    }

    if (!GENDER_VALUES.has(gender)) {
      return res.status(400).json({ code: "invalid_gender", message: "Invalid gender value" });
    }

    const misNum = Number(mis);
    if (!Number.isInteger(misNum) || misNum <= 0) {
      return res.status(400).json({ code: "invalid_mis", message: "Invalid MIS" });
    }

    const cgpaNum = Number(cgpa);
    if (Number.isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      return res.status(400).json({ code: "invalid_cgpa", message: "Invalid CGPA (0-10)" });
    }

    // duplicate user check (email unique in User)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ code: "user_exists", message: "User already exists" });
    }

    // optional: also prevent duplicate MIS at Student level
    const existingStudentByMis = await prisma.student.findUnique({ where: { mis: misNum } });
    if (existingStudentByMis) {
      return res.status(409).json({ code: "mis_exists", message: "Student with this MIS already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "student",
        student: {
          create: {
            name,
            mis: misNum,
            year,           // "FY" | "SY" | "TY" | "BE" (Prisma will store mapped values)
            gender,         // "MALE" | "FEMALE" | "OTHER"
            email,
            cgpa: cgpaNum,
            preference: preference ?? null,
          },
        },
      },
      include: { student: true },
    });

    return res.status(200).json({ message: "Student account created", userId: user.id, student: user.student });
  } catch (err: any) {
    if (err?.code === "P2002") {
      // unique constraint (email or mis)
      return res.status(409).json({ code: "conflict", message: "Duplicate value for a unique field" });
    }
    console.error(err);
    return res.status(500).json({ code: "server_error", message: "Internal Server Error" });
  }
}