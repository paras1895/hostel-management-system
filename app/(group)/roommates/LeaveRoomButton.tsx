// app/(group)/roommates/LeaveRoomButton.tsx
"use client";

import { useTransition } from "react";

export default function LeaveRoomButton() {
  const [isPending, start] = useTransition();

  const leave = () => {
    if (!confirm("Leave your current group?")) return;
    start(async () => {
      const res = await fetch("/api/room/leave", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed");
        return;
      }
      window.location.reload();
    });
  };

  return (
    <button className="btn btn-warning" onClick={leave} disabled={isPending}>
      Leave room
    </button>
  );
}
