"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeWatcher from "@/components/ThemeWatcher";
import RequestRoomButton from "@/components/RequestRoomButton";
import { useMemo } from "react";
import { getTodayMenu, WEEKLY_MENU, type DayKey } from "@/lib/mess";

type StudentDashboardProps = {
  student: any;
};

type CardRoom = {
  roomNumber?: string | null;
  blockName?: string | null;
  capacity?: number | null;
  count?: number | null;
  students?: { id: number; name: string; mis: number | null }[] | null;
};

export default function StudentDashboard({ student }: StudentDashboardProps) {
  const { isDark } = ThemeWatcher();

  const [cardRoom, setCardRoom] = useState<CardRoom | null>(null);
  const [pending, setPending] = useState<
    { id: number; name: string; mis: number | null }[]
  >([]);
  const [loadingCard, setLoadingCard] = useState(false);

  const today = useMemo(() => getTodayMenu("Asia/Kolkata"), []);
  const [selectedDay, setSelectedDay] = useState<DayKey>(today.day);
  const menu = useMemo(() => WEEKLY_MENU[selectedDay], [selectedDay]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoadingCard(true);
        const res = await fetch("/api/room/card");
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setCardRoom(data.room);
        setPending(data.pending || []);
      } finally {
        setLoadingCard(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const acceptedCount = cardRoom?.count ?? cardRoom?.students?.length ?? 0;
  const capacity = cardRoom?.capacity ?? student?.room?.capacity ?? 4;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="flex items-center justify-between p-4 bg-base-100 shadow-md md:hidden">
        <h1 className="text-xl font-semibold text-base-content">Dashboard</h1>
      </header>

      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            className={`${
              isDark ? "bg-gray-800" : "bg-white"
            } col-span-1 md:col-span-2 lg:col-span-1 card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-[20px]`}
          >
            <div className="card-body relative">
              <h2 className="card-title text-base-content mb-2">
                {student.name}
              </h2>
              <span
                className={`absolute top-4 right-4 px-2 py-1 text-xs font-semibold rounded-full ${
                  student.verified
                    ? "bg-success/20 text-success"
                    : "bg-error/20 text-error"
                }`}
              >
                {student.verified ? "Verified" : "Unverified"}
              </span>

              <div className="space-y-1 mt-2">
                <p>
                  <strong>Email:</strong> {student.email}
                </p>
                <p>
                  <strong>MIS:</strong> {student.mis}
                </p>
                <p>
                  <strong>Year:</strong> {student.year}
                </p>
                <p>
                  <strong>CGPA:</strong> {student.cgpa}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`${
              isDark ? "bg-gray-800" : "bg-white"
            } col-span-1 md:col-span-2 card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-[20px]`}
          >
            <div className="card-body relative">
              <h3 className="card-title">Room</h3>

              {student.room && (
                <div className="badge badge-primary absolute top-4 right-4">
                  {acceptedCount}/{capacity}
                </div>
              )}

              {student.room ? (
                <>
                  <p>
                    <strong>Room:</strong>{" "}
                    {cardRoom?.roomNumber ?? student.room.roomNumber}
                  </p>
                  <p>
                    <strong>Block:</strong>{" "}
                    {cardRoom?.blockName ?? student.room.block?.name ?? "-"}
                  </p>
                  <p>
                    <strong>Capacity:</strong> {capacity}
                  </p>

                  <h4 className="mt-3 font-semibold">Roommates</h4>
                  {loadingCard ? (
                    <div className="opacity-60">Loading...</div>
                  ) : cardRoom?.students?.length ? (
                    <ul className="list-disc pl-6">
                      {cardRoom.students
                        .filter((m) => m.id !== student.id)
                        .map((m) => (
                          <li key={m.id}>
                            {m.name} ({m.mis ?? "-"}){" "}
                            <span className="badge badge-success ml-2">
                              Accepted
                            </span>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <div className="opacity-60">No roommates yet.</div>
                  )}

                  {pending.length > 0 && (
                    <>
                      <h4 className="mt-3 font-semibold">Pending Invites</h4>
                      <ul className="list-disc pl-6">
                        {pending.map((p) => (
                          <li key={p.id}>
                            {p.name} ({p.mis ?? "-"}){" "}
                            <span className="badge badge-warning ml-2">
                              Pending
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <div className="mt-3">
                    <Link href="/roommates" className="btn btn-sm btn-outline">
                      Manage Roommates
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-start">
                  <p>No room assigned yet.</p>
                  <RequestRoomButton />
                </div>
              )}
            </div>
          </div>

          <div
            className={`${
              isDark ? "bg-gray-800" : "bg-white"
            } card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-[20px]`}
          >
            <div className="card-body">
              <h3 className="card-title">Mess Menu</h3>

              <div className="flex gap-2 flex-wrap text-sm mt-1">
                {(
                  [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ] as DayKey[]
                ).map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`btn btn-xs ${
                      d === selectedDay ? "btn-primary" : "btn-ghost"
                    }`}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>

              <div className="mt-3 space-y-2">
                <div>
                  <div className="font-semibold">Breakfast</div>
                  <ul className="list-disc pl-5 opacity-90">
                    {menu.breakfast.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="font-semibold">Lunch</div>
                  <ul className="list-disc pl-5 opacity-90">
                    {menu.lunch.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="font-semibold">Dinner</div>
                  <ul className="list-disc pl-5 opacity-90">
                    {menu.dinner.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="text-xs opacity-70 mt-2">
                Showing menu for <b>{selectedDay}</b>. (Repeats weekly.)
              </div>
            </div>
          </div>

          <div
            className={`${
              isDark ? "bg-gray-800" : "bg-white"
            } card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-[20px]`}
          >
            <div className="card-body">
              <h3 className="card-title">Complaints</h3>

              {student.complaints?.length ? (
                <div className="overflow-y-auto max-h-64 mt-2 space-y-2 pr-2">
                  <ul className="list-disc pl-4 space-y-2">
                    {student.complaints.map((c: any, i: number) => (
                      <li
                        key={i}
                        className="flex justify-between items-center bg-base-200 p-2 rounded-md"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{c.message}</p>
                          <p className="text-xs opacity-70">
                            {new Date(c.createdAt).toISOString().split("T")[0]}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            c.status === "Resolved"
                              ? "bg-success text-success-content"
                              : c.status === "In Progress"
                              ? "bg-warning text-warning-content"
                              : "bg-error text-error-content"
                          }`}
                        >
                          {c.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex flex-col items-start mt-2">
                  <p>No complaints filed yet.</p>
                  <Link
                    href={"/complaints"}
                    className="btn btn-sm btn-primary mt-3"
                  >
                    File Complaint
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div
            className={`${
              isDark ? "bg-gray-800" : "bg-white"
            } card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-[20px]`}
          >
            <div className="card-body">
              <h3 className="card-title">Payments</h3>

              {student.payments?.length ? (
                <ul className="list-disc pl-6">
                  {student.payments.map((p: any, i: number) => (
                    <li key={i}>
                      {p.description} —{" "}
                      <span
                        className={
                          p.status === "Paid" ? "text-success" : "text-error"
                        }
                      >
                        {p.status}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-start">
                  <p>No payments yet.</p>
                </div>
              )}
            </div>
          </div>

          <div
            className={`${
              isDark ? "bg-gray-800" : "bg-white"
            } col-span-1 md:col-span-2 card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-[20px]`}
          >
            <div className="card-body">
              <h3 className="card-title">Roommates</h3>
              {!student.room ? (
                <div className="flex flex-col items-start">
                  <p>No room assigned yet.</p>
                  <RequestRoomButton />
                </div>
              ) : (
                <>
                  <p className="opacity-70 mb-2">
                    Manage your invites and accept requests.
                  </p>
                  <Link href={"/roommates"} className="btn btn-sm btn-primary">
                    Go to Roommates
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
