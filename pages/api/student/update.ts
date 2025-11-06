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

  const { name, email, gender, cgpa, preference } = req.body ?? {};

  try {
    const result = await prisma.$transaction(async (tx) => {

      await tx.$executeRaw`
        UPDATE Student
        SET
          name = ${name},
          gender = ${gender},
          email = ${email},
          cgpa = ${cgpa},
          preference = ${preference},
          updatedAt = NOW()
        WHERE id = ${user.student.id}
      `;

      await tx.$executeRaw`
        UPDATE \`User\`
        SET
          email = ${email},
          updatedAt = NOW()
        WHERE id = ${user.id}
      `;

      return { ok: true as const };
    });

    return res.status(200).json(result);
  } catch (e: any) {
    if (e?.code === "P2002" || (typeof e?.message === "string" && e.message.includes("Duplicate entry"))) {
      return res.status(409).json({ error: "Email already in use" });
    }
    console.error(e);
    return res.status(500).json({ error: e?.message ?? "Failed" });
  }
}