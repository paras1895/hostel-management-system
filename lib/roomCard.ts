// lib/roomCard.ts
import { prisma } from "@/lib/prisma";

export async function getRoomCardData(studentId: number) {
  // find student's current room
  const me = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, roomId: true },
  });
  if (!me?.roomId) return null;

  const room = await prisma.room.findUnique({
    where: { id: me.roomId },
    select: {
      id: true,
      roomNumber: true,
      capacity: true,
      block: { select: { name: true } },
      students: { select: { id: true, name: true, mis: true } },
      _count: { select: { students: true } },
    },
  });

  if (!room) return null;

  // pending invites TO this room
  const pendingInvites = await prisma.roomInvite.findMany({
    where: { roomId: room.id, status: "PENDING" },
    select: {
      id: true,
      toStudent: { select: { id: true, name: true, mis: true } },
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    room: {
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      blockName: room.block?.name ?? null,
      count: room._count.students,
      students: room.students, // accepted members
    },
    pending: pendingInvites.map((i) => i.toStudent),
  };
}
