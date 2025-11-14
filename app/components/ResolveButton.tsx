// app/warden/complaints/ResolveButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResolveButton({ complaintId }: { complaintId: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleResolve() {
    if (!confirm("Mark this complaint as resolved?")) return;

    try {
      setLoading(true);
      const res = await fetch("/api/complaints/resolve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ complaintId }),
      });

      if (!res.ok) {
        let msg = `Failed to resolve (status ${res.status})`;
        try {
          const j = await res.json();
          msg = j?.error ?? j?.message ?? msg;
        } catch {
        }
        alert(msg);
        return;
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      alert("An error occurred while resolving the complaint.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleResolve}
      className="btn btn-sm btn-success"
      disabled={loading}
    >
      {loading ? "Resolving..." : "Mark Resolved"}
    </button>
  );
}