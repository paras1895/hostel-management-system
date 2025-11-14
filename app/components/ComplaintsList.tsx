"use client";

import ResolveButton from "./ResolveButton";
import ThemeWatcher from "../components/ThemeWatcher";

export default function ComplaintsList({ complaints }: { complaints: any[] }) {
  const { isDark } = ThemeWatcher();

  return (
    <div
      className="bg-base-100 shadow p-4"
    >
      {complaints.length === 0 ? (
        <p className="p-6">No complaints found.</p>
      ) : (
        <ul className="space-y-3">
          {complaints.map((c) => (
            <li
              key={c.id}
              className={`${
                isDark ? "bg-gray-800" : "bg-white"
              } flex flex-col md:flex-row md:items-center justify-between gap-4 bg-base-200 p-4 rounded-md`}
            >
              <div className="flex-1">
                <p className="font-medium text-lg">{c.message}</p>

                <div className="mt-2 text-sm opacity-80 space-y-1">
                  <p>
                    <strong>Student:</strong> {c.student?.name ?? "—"}{" "}
                    {c.student?.email ? `(${c.student.email})` : ""}
                  </p>
                  <p>
                    <strong>MIS:</strong> {c.student?.mis ?? "—"}
                  </p>
                  <p>
                    <strong>Room:</strong>{" "}
                    {c.student?.room
                      ? `${c.student.room.roomNumber} (${
                          c.student.room.block?.name ?? "—"
                        })`
                      : "Not assigned"}
                  </p>
                  <p>
                    <strong>Filed:</strong>{" "}
                    {new Date(c.createdAt).toLocaleString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={
                        c.status === "Resolved"
                          ? "text-success"
                          : c.status === "In Progress"
                          ? "text-warning"
                          : "text-error"
                      }
                    >
                      {c.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex-none flex gap-2 items-center">
                {c.status !== "Resolved" ? (
                  <ResolveButton complaintId={c.id} />
                ) : (
                  <span className="px-3 py-1 rounded-md text-sm bg-base-300">
                    Resolved
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
