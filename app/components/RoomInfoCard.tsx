"use client";

import ThemeWatcher from "./ThemeWatcher";

type AcceptedMate = { id: number; name: string; mis: number | null };
type PendingMate = { id: number; name: string; mis: number | null };

type Props = {
  meId?: number;
  room?: {
    roomNumber?: string | null;
    blockName?: string | null;
    capacity?: number | null;
    count?: number | null;
    students?: AcceptedMate[] | null;
  } | null;
  pending?: PendingMate[];
};

export default function RoomInfoCard({ meId, room, pending = [] }: Props) {
  const { isDark } = ThemeWatcher();

  if (!room) {
    return (
      <div className={`${isDark ? "bg-gray-800" : "bg-white"} text-base-content p-6 rounded-lg shadow-md relative`}>
        <h2 className="text-xl font-semibold mb-2">Room Information</h2>
        <p className="opacity-70">No room assigned yet.</p>
      </div>
    );
  }

  const capacity = room.capacity ?? 4;
  const acceptedCount = room.count ?? room.students?.length ?? 0;

  return (
    <div className={`${isDark ? "bg-gray-800" : "bg-white"} text-base-content p-6 rounded-lg shadow-md relative`}>
      <div className="badge badge-primary absolute top-3 right-3">
        {acceptedCount}/{capacity}
      </div>

      <h2 className="text-xl font-semibold mb-1">Room Information</h2>
      <p className="text-sm opacity-70 mb-4">
        {room.blockName ? `${room.blockName} • ` : ""}
        {room.roomNumber ?? "—"}
      </p>

      <h3 className="mt-2 font-medium">Roommates</h3>
      {room.students?.length ? (
        <ul className="list-disc list-inside space-y-1 mt-1">
          {room.students.map((mate) => (
            <li key={mate.id}>
              {mate.name ?? "-"} ({mate.mis ?? "-"}){" "}
              {meId === mate.id && <span className="badge badge-ghost ml-2">You</span>}
              <span className="badge badge-success ml-2">Accepted</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="opacity-70">No roommates yet.</p>
      )}

      {pending.length > 0 && (
        <>
          <h3 className="mt-4 font-medium">Pending Invites</h3>
          <ul className="list-disc list-inside space-y-1 mt-1">
            {pending.map((p) => (
              <li key={p.id}>
                {p.name ?? "-"} ({p.mis ?? "-"}) <span className="badge badge-warning ml-2">Pending</span>
            </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}