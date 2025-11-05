"use client";

import { useState } from "react";

export default function RequestRoomButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    try {
      setLoading(true);
      const res = await fetch("/api/room/request", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Failed to request room");
        return;
      }
      location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="btn btn-sm btn-primary mt-3" onClick={handleClick} disabled={loading}>
      {loading ? "Requesting..." : "Request Room"}
    </button>
  );
}
