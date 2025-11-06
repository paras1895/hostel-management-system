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

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const emailExistRows = await tx.$queryRaw<{ found: number | bigint }[]>`
        SELECT EXISTS(SELECT 1 FROM \`User\` WHERE email = ${email} LIMIT 1) AS found
      `;
      const emailExists = Number(emailExistRows[0]?.found ?? 0) === 1;
      if (emailExists) {
        throw Object.assign(new Error("user_exists"), { http: 409, code: "user_exists" });
      }

      const misExistRows = await tx.$queryRaw<{ found: number | bigint }[]>`
        SELECT EXISTS(SELECT 1 FROM Student WHERE mis = ${misNum} LIMIT 1) AS found
      `;
      const misExists = Number(misExistRows[0]?.found ?? 0) === 1;
      if (misExists) {
        throw Object.assign(new Error("mis_exists"), { http: 409, code: "mis_exists" });
      }

      await tx.$executeRaw`
        INSERT INTO Student (
          name, mis, year, gender, email, cgpa, preference, verified, createdAt, updatedAt
        ) VALUES (
          ${name},
          ${misNum},
          ${year},
          ${gender},
          ${email},
          ${cgpaNum},
          ${preference ?? null},
          ${false},
          NOW(),
          NOW()
        )
      `;

      const sid = await tx.$queryRaw<{ id: number | bigint }[]>`
        SELECT CAST(LAST_INSERT_ID() AS UNSIGNED) AS id
      `;
      const studentId = Number(sid[0].id);

      await tx.$executeRaw`
        INSERT INTO \`User\` (
          email, password, role, studentId, createdAt, updatedAt
        ) VALUES (
          ${email},
          ${hashedPassword},
          ${"student"},
          ${studentId},
          NOW(),
          NOW()
        )
      `;

      const uid = await tx.$queryRaw<{ id: number | bigint }[]>`
        SELECT CAST(LAST_INSERT_ID() AS UNSIGNED) AS id
      `;
      const userId = Number(uid[0].id);

      const studentRows = await tx.$queryRaw<any[]>`
        SELECT
          CAST(id AS UNSIGNED)        AS id,
          CAST(mis AS UNSIGNED)       AS mis,
          name,
          year,
          gender,
          email,
          CAST(cgpa AS DECIMAL(10,2)) AS cgpa,
          preference,
          verified,
          createdAt,
          updatedAt
        FROM Student
        WHERE id = ${studentId}
        LIMIT 1
      `;
      const student = JSON.parse(
        JSON.stringify(studentRows[0] ?? {}, (_k, v) => (typeof v === "bigint" ? Number(v) : v))
      );

      return { message: "Student account created", userId, student };
    });

    return res.status(200).json(result);
  } catch (err: any) {
    if (err?.http) {
      return res.status(err.http).json({ code: err.code, message: err.message });
    }
    if (typeof err?.message === "string" && err.message.includes("Duplicate entry")) {
      return res.status(409).json({ code: "conflict", message: "Duplicate value for a unique field" });
    }
    console.error(err);
    return res.status(500).json({ code: "server_error", message: "Internal Server Error" });
  }
}