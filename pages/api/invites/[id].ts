import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "../_utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") return res.status(405).end();

  const user = await getUserFromRequest(req);
  if (!user?.student?.id)
    return res.status(401).json({ error: "Unauthorized" });

  const inviteId = Number(req.query.id);
  const { action } = (req.body ?? {}) as { action?: "ACCEPT" | "DECLINE" };
  if (!inviteId || (action !== "ACCEPT" && action !== "DECLINE")) {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const invites = await tx.$queryRaw<any[]>`
        SELECT 
          ri.id AS id,
          ri.fromStudentId,
          ri.toStudentId,
          ri.roomId,
          ri.status,
          r.capacity,
          r.groupGender,
          r.groupYear,
          (SELECT COUNT(*) FROM Student WHERE roomId = r.id) AS studentCount
        FROM RoomInvite ri
        JOIN Room r ON r.id = ri.roomId
        WHERE ri.id = ${inviteId}
        LIMIT 1
      `;
      const invite = invites[0];
      if (
        !invite ||
        invite.toStudentId !== user.student.id ||
        invite.status !== "PENDING"
      ) {
        throw new Error("Invalid invite");
      }

      if (action === "DECLINE") {
        await tx.$executeRaw`
    DELETE FROM RoomInvite
    WHERE id = ${inviteId}
    LIMIT 1
  `;
        return { status: "DECLINED" as const };
      }

      const meRows = await tx.$queryRaw<any[]>`
        SELECT id, roomId, gender, year
        FROM Student
        WHERE id = ${user.student.id}
        LIMIT 1
      `;
      const me = meRows[0];
      if (!me) throw new Error("Student not found");

      if (me.roomId && me.roomId !== invite.roomId) {
        throw new Error(
          "You are already in another room. Leave it before accepting this invite."
        );
      }

      if (!invite.groupGender || !invite.groupYear) {
        await tx.$executeRaw`
          UPDATE Room
          SET groupGender = COALESCE(groupGender, ${me.gender}),
              groupYear   = COALESCE(groupYear, ${me.year})
          WHERE id = ${invite.roomId}
        `;
      }

      const lockedRooms = await tx.$queryRaw<any[]>`
        SELECT 
          id,
          capacity,
          groupGender,
          groupYear,
          (SELECT COUNT(*) FROM Student WHERE roomId = Room.id) AS studentCount
        FROM Room
        WHERE id = ${invite.roomId}
        LIMIT 1
      `;
      const locked = lockedRooms[0];
      if (!locked?.groupGender || !locked?.groupYear) {
        throw new Error("Room policy not configured. Try again.");
      }

      if (me.gender !== locked.groupGender) {
        throw new Error("This room is restricted to same-gender roommates.");
      }
      if (me.year !== locked.groupYear) {
        throw new Error("This room is restricted to same-year roommates.");
      }

      if (locked.studentCount >= locked.capacity) {
        throw new Error("Room is full now. Try another room.");
      }

      await tx.$executeRaw`
        UPDATE Student SET roomId = ${invite.roomId}
        WHERE id = ${user.student.id}
      `;

      await tx.$executeRaw`
        UPDATE RoomInvite
        SET status = ${"ACCEPTED"}, respondedAt = NOW()
        WHERE id = ${inviteId}
      `;

      await tx.$executeRaw`
  DELETE FROM RoomInvite
  WHERE toStudentId = ${user.student.id}
    AND status = ${"PENDING"}
    AND id <> ${inviteId}
`;

      await tx.$executeRaw`
  DELETE FROM RoomInvite
  WHERE fromStudentId = ${user.student.id}
    AND status = ${"PENDING"}
    AND roomId <> ${invite.roomId}
`;

      return { status: "ACCEPTED" as const };
    });

    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(400).json({ error: e?.message ?? "Failed" });
  }
}
