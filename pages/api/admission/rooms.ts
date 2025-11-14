// pages/api/admission/rooms.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "../_utils";

function normalizeBlockName(name: string | null | undefined) {
  if (!name) return "";
  const s = String(name).trim();

  const m1 = s.match(/[Bb]lock[\s\-]*([A-Za-z])$/);
  if (m1 && m1[1]) return m1[1].toUpperCase();
  const m2 = s.match(/^([A-Za-z])$/); // single letter
  if (m2) return m2[1].toUpperCase();

  const letter = s.match(/[A-Za-z]/);
  if (letter) return letter[0].toUpperCase();
  return s.replace(/\s+/g, "").toUpperCase();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    let user;
    try {
      user = await getUserFromRequest(req);
    } catch (e) {
      user = null;
    }

    let whereClause: any = { NOT: { block: { name: "Provisional" } } };

    if (user?.student) {
      const student = await prisma.student.findUnique({
        where: { id: Number(user.student.id) },
        select: { year: true },
      });
      if (student && student.year) {
        whereClause = {
          ...whereClause,
          AND: [{ groupYear: student.year }],
        };
      }
    }

    const rooms = await prisma.room.findMany({
      where: whereClause,
      include: { block: true },
      orderBy: [{ block: { name: "asc" } }, { roomNumber: "asc" }],
    });

    const out = rooms.map((r) => {
      const shortBlock = normalizeBlockName(r.block?.name ?? null);
      return {
        id: r.id,
        roomNumber: r.roomNumber,
        blockName: r.block?.name ?? null,
        blockShort: shortBlock,
        roomCode: `${shortBlock}-${r.roomNumber}`,
        capacity: r.capacity,
        groupYear: r.groupYear ?? null,
        groupGender: r.groupGender ?? null,
      };
    });

    return res.status(200).json({ success: true, rooms: out });
  } catch (err) {
    console.error("rooms api error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
