// app/(group)/roommates/InviteCard.tsx
"use client";

import { useTransition } from "react";

export default function InviteCard({ invite }: { invite: any }) {
  const [isPending, start] = useTransition();

  const inviteId =
    invite?.id ?? invite?.inviteId;
  const fromName =
    invite?.fromStudent?.name ?? invite?.fromStudentName ?? "Unknown";
  const roomNumber =
    invite?.room?.roomNumber ?? invite?.roomNumber ?? "—";
  const capacity =
    invite?.room?.capacity ?? invite?.capacity ?? 0;
  const occupants =
    invite?.room?._count?.students ?? invite?.currentOccupancy ?? 0;

  const act = (action: "ACCEPT" | "DECLINE") => {
    start(async () => {
      const res = await fetch(`/api/invites/${inviteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed");
        return;
      }
      window.location.reload();
    });
  };

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <div className="font-medium">{fromName}</div>
        <div className="text-sm opacity-70">
          Invites you to join room {roomNumber} ({occupants}/{capacity})
        </div>
        <div className="card-actions mt-3">
          <button className="btn btn-primary" onClick={() => act("ACCEPT")} disabled={isPending}>
            Accept
          </button>
          <button className="btn" onClick={() => act("DECLINE")} disabled={isPending}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
