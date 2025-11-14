import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "../_utils";

type RoomCode = { blockName: string; roomNumber: string };

function parseRoomCode(code: string): RoomCode | null {
  const s = String(code).trim().toUpperCase();
  const m = s.match(/^([A-Z])-(\d{3})$/);
  if (!m) return null;
  return { blockName: m[1], roomNumber: m[2] };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const user = await getUserFromRequest(req);
  if (!user?.warden)
    return res.status(401).json({ error: "Unauthorized. Warden required." });

  try {
    const provisionalRooms = await prisma.room.findMany({
      where: { block: { name: "Provisional" } },
      include: {
        students: { select: { id: true, name: true, cgpa: true, year: true } },
      },
    });

    const tempList = provisionalRooms.map((r) => {
      const students = r.students.map((s) => ({
        id: s.id,
        cgpa: Number(s.cgpa ?? 0),
        year: s.year,
        name: s.name ?? "",
      }));

      students.sort((a, b) => {
        if (b.cgpa !== a.cgpa) return b.cgpa - a.cgpa;
        return a.name.localeCompare(b.name);
      });

      const topStudent =
        students.length > 0 ? students[0] : { id: null, cgpa: 0, name: "" };
      return {
        tempRoom: r,
        highestCgpa: topStudent.cgpa,
        topStudentName: topStudent.name,
        students,
      };
    });

    tempList.sort((a, b) => {
      if (b.highestCgpa !== a.highestCgpa) return b.highestCgpa - a.highestCgpa;

      return (a.topStudentName ?? "").localeCompare(b.topStudentName ?? "");
    });

    const allTargetRooms = await prisma.room.findMany({
      where: { NOT: { block: { name: "Provisional" } } },
      include: { block: true },
    });

    const occupancy = new Map<
      number,
      { room: any; capacity: number; occupied: number }
    >();
    for (const r of allTargetRooms) {
      const cntRow = await prisma.$queryRaw<{ cnt: number }[]>`
        SELECT COUNT(*) AS cnt FROM Student WHERE roomId = ${r.id}
      `;
      const occ = Number(cntRow[0]?.cnt ?? 0);
      occupancy.set(r.id, {
        room: r,
        capacity: r.capacity ?? 4,
        occupied: occ,
      });
    }

    function findRoomByCode(code: RoomCode) {
      for (const [, v] of occupancy) {
        if (
          v.room.block?.name === code.blockName &&
          v.room.roomNumber === code.roomNumber
        ) {
          return { room: v.room, roomState: v };
        }
      }
      return null;
    }

    function findFallbackRooms(preferredYear?: string) {
      const arr = Array.from(occupancy.values()).filter(
        (v) => v.occupied < v.capacity
      );

      arr.sort((a, b) => {
        const aMatch = a.room.groupYear === preferredYear ? 1 : 0;
        const bMatch = b.room.groupYear === preferredYear ? 1 : 0;

        if (bMatch !== aMatch) return bMatch - aMatch;
        return b.capacity - b.occupied - (a.capacity - a.occupied);
      });
      return arr;
    }

    const results: {
      studentId: number;
      assignedRoomId?: number;
      note?: string;
    }[] = [];

    await prisma.$transaction(async (tx) => {
      for (const temp of tempList) {
        const students = temp.students;

        const prefRow = await tx.preference.findFirst({
          where: { tempRoomId: temp.tempRoom.id },
        });
        const prefList: string[] = prefRow
          ? JSON.parse(prefRow.preferences)
          : [];

        let studentIdx = 0;
        for (const prefCode of prefList) {
          if (studentIdx >= students.length) break;
          const parsed = parseRoomCode(prefCode);
          if (!parsed) continue;
          const found = findRoomByCode(parsed);
          if (!found) continue;
          const state = found.roomState;

          let available = state.capacity - state.occupied;
          while (available > 0 && studentIdx < students.length) {
            const s = students[studentIdx++];

            await tx.student.update({
              where: { id: s.id },
              data: { roomId: state.room.id },
            });
            await tx.allocation.create({
              data: {
                studentId: s.id,
                roomId: state.room.id,
                note: `Preference ${prefCode}`,
              },
            });
            state.occupied += 1;
            available -= 1;
            results.push({
              studentId: s.id,
              assignedRoomId: state.room.id,
              note: `Preferred ${prefCode}`,
            });
          }
        }

        if (studentIdx < students.length) {
          const fallback = findFallbackRooms(
            temp.tempRoom?.students?.[0]?.year ?? undefined
          );
          for (const f of fallback) {
            while (f.occupied < f.capacity && studentIdx < students.length) {
              const s = students[studentIdx++];
              await tx.student.update({
                where: { id: s.id },
                data: { roomId: f.room.id },
              });
              await tx.allocation.create({
                data: { studentId: s.id, roomId: f.room.id, note: "Fallback" },
              });
              f.occupied += 1;
              results.push({
                studentId: s.id,
                assignedRoomId: f.room.id,
                note: "Fallback",
              });
            }
            if (studentIdx >= students.length) break;
          }
        }

        while (studentIdx < students.length) {
          const s = students[studentIdx++];
          results.push({
            studentId: s.id,
            assignedRoomId: undefined,
            note: "No space available",
          });
        }
      }
    });

    return res.status(200).json({ success: true, results });
  } catch (err) {
    console.error("run-allocation error:", err);
    return res.status(500).json({ error: "Allocation failed" });
  }
}
