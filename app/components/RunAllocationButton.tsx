// app/warden/allocation/RunAllocationButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RunAllocationButton() {
  const [running, setRunning] = useState(false);
  const router = useRouter();

  async function run() {
    if (!confirm("Run allocation now? This will assign students into rooms based on preferences.")) return;
    try {
      setRunning(true);
      const res = await fetch("/api/admission/run-allocation", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error ?? `Allocation failed (status ${res.status})`);
        return;
      }

      if (data?.results && Array.isArray(data.results)) {
        const assigned = data.results.filter((r: any) => r.assignedRoomId).length;
        const unplaced = data.results.filter((r: any) => !r.assignedRoomId).length;
        alert(`Allocation finished. Assigned: ${assigned}. Unplaced: ${unplaced}.`);
      } else if (data?.success) {
        alert("Allocation finished.");
      } else {
        alert("Allocation finished (no summary).");
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Network or server error while running allocation.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <button className="btn btn-primary" onClick={run} disabled={running}>
      {running ? "Running…" : "Run Allocation"}
    </button>
  );
}
