// app/(group)/roommates/CandidateCard.tsx
"use client";

import { useTransition, useState } from "react";

export default function CandidateCard({ candidate }: { candidate: any }) {
  const [isPending, start] = useTransition();
  const [invited, setInvited] = useState(false); // lock the button after success

  const invite = () => {
    start(async () => {
      try {
        const res = await fetch(`/api/invites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toStudentId: candidate.id }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.ok) {
          alert(data?.error || "Failed to send invite");
          return;
        }

        setInvited(true);
        alert(data.alreadyExisted ? "Invite is already pending." : "Invite sent!");
      } catch {
        alert("Network error");
      }
    });
  };

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <div className="font-medium">{candidate.name}</div>
        <div className="text-sm opacity-70">{candidate.email}</div>
        <div className="text-xs mt-2">
          {candidate.roomId
            ? `In a group: ${candidate.roomSize}/${candidate.roomCapacity}`
            : "Not in a group yet"}
        </div>
        <div className="card-actions mt-3">
          <button
            className={`btn ${invited ? "btn-disabled" : "btn-outline"}`}
            onClick={invite}
            disabled={isPending || invited}
          >
            {isPending ? "Sending..." : invited ? "Invited" : "Invite"}
          </button>
        </div>
      </div>
    </div>
  );
}