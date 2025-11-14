import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "../_utils";

function isRoomCode(s: string) {
  return /^[A-Z]+-\d{3}$/.test(String(s).toUpperCase());
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const method = req.method ?? "GET";
  if (method !== "GET" && method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const user = await getUserFromRequest(req);
  if (!user?.student)
    return res
      .status(401)
      .json({ error: "Only students can use this endpoint." });

  const studentId = Number(user.student.id ?? user.studentId);
  if (!studentId) return res.status(400).json({ error: "Invalid student." });

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { room: { include: { block: true } } },
  });
  if (!student) return res.status(404).json({ error: "Student not found." });

  if (!student.roomId || student.room?.block?.name !== "Provisional") {
    if (method === "GET") {
      return res.status(200).json({ inProvisional: false });
    }
    return res
      .status(400)
      .json({
        error: "You must be in a provisional room to submit preferences.",
      });
  }

  const tempRoomId = student.roomId;

  const occRow = await prisma.$queryRaw<{ cnt: number }[]>`
    SELECT COUNT(*) as cnt FROM Student WHERE roomId = ${tempRoomId}
  `;
  const currentOccupancy = Number(occRow[0]?.cnt ?? 0);
  const roomCapacity = student.room?.capacity ?? 4;

  if (method === "GET") {
    try {
      const pref = await prisma.preference.findFirst({ where: { tempRoomId } });
      if (!pref) {
        return res.status(200).json({
          inProvisional: true,
          tempRoom: {
            id: student.room?.id,
            roomNumber: student.room?.roomNumber,
            capacity: roomCapacity,
            currentOccupancy,
          },
          exists: false,
        });
      }
      return res.status(200).json({
        inProvisional: true,
        tempRoom: {
          id: student.room?.id,
          roomNumber: student.room?.roomNumber,
          capacity: roomCapacity,
          currentOccupancy,
        },
        exists: true,
        preference: JSON.parse(pref.preferences),
        submittedBy: pref.submittedBy,
        submittedAt: pref.createdAt,
        prefId: pref.id,
      });
    } catch (err) {
      console.error("preferences GET error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  try {
    const body = req.body ?? {};
    if (!Array.isArray(body.preferences))
      return res.status(400).json({ error: "preferences must be an array." });
    const clean = body.preferences
      .map((p: any) => String(p).trim().toUpperCase())
      .filter(isRoomCode);

    if (clean.length === 0)
      return res.status(400).json({ error: "No valid preferences provided." });

    if (currentOccupancy < roomCapacity) {
      return res.status(400).json({
        error: `Your provisional room is not full yet (${currentOccupancy}/${roomCapacity}). Preferences can be submitted only when the provisional room is full.`,
        currentOccupancy,
        roomCapacity,
      });
    }

    const existing = await prisma.preference.findFirst({
      where: { tempRoomId },
    });

    if (existing && existing.submittedBy !== studentId) {
      return res.status(403).json({
        error:
          "Preferences already submitted for your provisional room by another member. Contact your group.",
        submittedBy: existing.submittedBy,
      });
    }

    const parsedCodes = clean.map((c) => {
      const [blockShort, roomNumber] = c.split("-");
      return {
        blockShort: blockShort.trim(),
        roomNumber: roomNumber.trim(),
        code: c,
      };
    });

    const roomMatches = await prisma.room.findMany({
      where: {
        roomNumber: { in: parsedCodes.map((p) => p.roomNumber) },
        NOT: { block: { name: "Provisional" } },
      },
      include: { block: true },
    });

    const availableCodes = new Set(
      roomMatches.map((r) => {
        const bn = String(r.block?.name ?? "");
        const short = (
          bn.match(/[Bb]lock[\s\-]*([A-Za-z])$/)?.[1] ??
          bn.match(/^([A-Za-z])$/)?.[1] ??
          bn.match(/[A-Za-z]/)?.[0] ??
          bn
        ).toUpperCase();
        return `${short}-${r.roomNumber}`.toUpperCase();
      })
    );

    const invalid = clean.filter((c) => !availableCodes.has(c));
    if (invalid.length > 0) {
      return res
        .status(400)
        .json({
          error: `Some room codes do not exist or are invalid: ${invalid.join(
            ", "
          )}`,
        });
    }

    let saved;
    if (existing) {
      saved = await prisma.preference.update({
        where: { id: existing.id },
        data: { preferences: JSON.stringify(clean), submittedBy: studentId },
      });
    } else {
      saved = await prisma.preference.create({
        data: {
          tempRoomId,
          submittedBy: studentId,
          preferences: JSON.stringify(clean),
        },
      });
    }

    return res
      .status(200)
      .json({ success: true, count: clean.length, savedId: saved.id });
  } catch (err) {
    console.error("preferences POST error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
