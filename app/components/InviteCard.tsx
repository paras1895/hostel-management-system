"use client";

import { useTransition } from "react";

export default function InviteCard({ invite }: { invite: any }) {
  const [isPending, start] = useTransition();

  const act = (action: "ACCEPT" | "DECLINE") => {
    start(async () => {
      const res = await fetch(`/api/invites/${invite.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      // refresh
      window.location.reload();
    });
  };

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <div className="font-medium">{invite.fromStudent.name}</div>
        <div className="text-sm opacity-70">
          Invites you to join room {invite.room.roomNumber} ({invite.room._count.students}/{invite.room.capacity})
        </div>
        <div className="card-actions mt-3">
          <button className="btn btn-primary" onClick={() => act("ACCEPT")} disabled={isPending}>Accept</button>
          <button className="btn" onClick={() => act("DECLINE")} disabled={isPending}>Decline</button>
        </div>
      </div>
    </div>
  );
}