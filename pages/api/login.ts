// pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { serialize } from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ message: "Invalid credentials" });

  try {
    const rows = await prisma.$queryRaw<{ id: number | bigint; password: string }[]>`
      SELECT id, password
      FROM User
      WHERE email = ${email}
      LIMIT 1
    `;
    if (rows.length === 0) return res.status(400).json({ message: "Invalid credentials" });

    const userId = Number(rows[0].id);
    const hash = rows[0].password;

    const valid = await bcrypt.compare(password, hash);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    res.setHeader(
      "Set-Cookie",
      serialize("token", String(userId), {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      })
    );

    return res.status(200).json({ message: "Logged in" });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}