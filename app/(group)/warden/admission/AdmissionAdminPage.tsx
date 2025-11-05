// app/warden/admission/page.tsx
"use client";

import { useState, useTransition } from "react";

type AllocationRow = {
  provisionalRoomId: number;
  avgCgpa: number;
  groupSize: number;
  chosenRoomId?: number;
  chosenRoomNumber?: string;
  reason?: string;
};

export default function AdmissionAdminPage() {
  const [busySeed, startSeed] = useTransition();
  const [busyRun, startRun] = useTransition();
  const [rows, setRows] = useState<AllocationRow[]>([]);
  const [msg, setMsg] = useState<string>("");

  const seed = () => {
    startSeed(async () => {
      setMsg("");
      try {
        const res = await fetch("/api/admission/seed-rooms", { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) {
          setMsg(data?.error || "Failed to seed rooms.");
          return;
        }
        setMsg(data?.message || "Seeded rooms A/B/C.");
      } catch {
        setMsg("Network error.");
      }
    });
  };

  const run = () => {
    startRun(async () => {
      setMsg("");
      setRows([]);
      try {
        const res = await fetch("/api/admission/run", { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) {
          setMsg(data?.error || "Failed to run allocation.");
          return;
        }
        setRows(data.results || []);
        setMsg("Allocation complete.");
      } catch {
        setMsg("Network error.");
      }
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Admission Allocation (Warden)</h1>

      <div className="card bg-base-100 shadow">
        <div className="card-body flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold">Rooms & Allocation</div>
            <div className="text-sm opacity-70">
              Seed blocks A/B/C with 50 rooms each, then run allocation.  
              Allocation orders groups by <b>avg CGPA (desc)</b> and assigns first available preferred room.
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn" onClick={seed} disabled={busySeed}>
              {busySeed ? "Seeding..." : "Seed Rooms"}
            </button>
            <button className="btn btn-primary" onClick={run} disabled={busyRun}>
              {busyRun ? "Running..." : "Run Allocation"}
            </button>
          </div>
        </div>
      </div>

      {msg && <div className="alert">{msg}</div>}

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="font-semibold mb-2">Results</div>
          {rows.length === 0 ? (
            <div className="opacity-60 text-sm">No results yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Provisional Room ID</th>
                    <th>Avg CGPA</th>
                    <th>Group Size</th>
                    <th>Assigned Room</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={`${r.provisionalRoomId}-${idx}`}>
                      <td>{r.provisionalRoomId}</td>
                      <td>{r.avgCgpa.toFixed(2)}</td>
                      <td>{r.groupSize}</td>
                      <td>{r.chosenRoomNumber ?? "-"}</td>
                      <td>
                        {r.chosenRoomNumber ? (
                          <span className="badge badge-success">Allotted</span>
                        ) : (
                          <span className="badge badge-warning">
                            {r.reason ?? "Not allotted"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="text-xs opacity-60">
        Note: This run reserves a real room for one group per run. If you want to allow multiple groups to share a large room,
        we can tweak the algorithm to rely purely on capacity.
      </div>
    </div>
  );
}