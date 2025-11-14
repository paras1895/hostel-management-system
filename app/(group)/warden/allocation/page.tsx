// app/warden/allocation/page.tsx
import Link from "next/link";
import RunAllocationButton from "@/components/RunAllocationButton";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function WardenAllocationPage() {
  const user = await getCurrentUser();
  if (!user) return <p className="p-6">Please log in.</p>;
  if (user.role !== "warden") return <p className="p-6">Unauthorized. Warden access required.</p>;

  const rooms = await prisma.room.findMany({
    where: { NOT: { block: { name: "Provisional" } } },
    include: {
      block: true,
      students: {
        select: { id: true, name: true, email: true, cgpa: true, year: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: [{ block: { name: "asc" } }, { roomNumber: "asc" }],
  });

  const provisionalRooms = await prisma.room.findMany({
    where: { block: { name: "Provisional" } },
    include: { students: { select: { id: true } } },
    orderBy: { roomNumber: "asc" },
  });

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">🏷️ Allocation — Admin</h1>
        <div className="flex items-center gap-2">
          <Link href="/warden" className="btn btn-ghost">
            ← Back
          </Link>
          <RunAllocationButton />
        </div>
      </div>

      <div className="card bg-base-100 shadow p-4">
        <h2 className="text-xl font-semibold mb-2">Provisional rooms (summary)</h2>
        <div className="text-sm opacity-80 mb-2">
          {provisionalRooms.length} provisional rooms · total provisional students:{" "}
          {provisionalRooms.reduce((acc, r) => acc + (r.students?.length ?? 0), 0)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {provisionalRooms.map((r) => (
            <div key={r.id} className="card bg-base-200 p-3">
              <div className="font-medium">{r.roomNumber}</div>
              <div className="text-sm opacity-70">{r.students?.length ?? 0} students</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card bg-base-100 shadow p-4">
        <h2 className="text-xl font-semibold mb-3">Assigned rooms (non-provisional)</h2>

        {rooms.length === 0 ? (
          <div className="p-6">No rooms found (non-provisional).</div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupByBlock(rooms)).map(([blockName, blockRooms]) => (
              <section key={blockName}>
                <h3 className="text-lg font-semibold mb-2">Block {blockName}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {blockRooms.map((r) => (
                    <div key={r.id} className="card bg-base-200 p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">Room {r.roomNumber}</div>
                          <div className="text-xs opacity-70">
                            Capacity: {r.capacity} · Occupied: {r.students.length}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        {r.students.length === 0 ? (
                          <div className="text-sm opacity-70">Empty</div>
                        ) : (
                          r.students.map((s) => (
                            <div key={s.id} className="rounded-md p-2 bg-base-100">
                              <div className="font-medium text-sm">{s.name}</div>
                              <div className="text-xs opacity-70">
                                {s.email} · CGPA: {typeof s.cgpa === "number" ? s.cgpa.toFixed(2) : s.cgpa} · {s.year}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function groupByBlock(rooms: any[]) {
  const m: Record<string, any[]> = {};
  for (const r of rooms) {
    const key = (r.block?.name ?? "—").toString();
    if (!m[key]) m[key] = [];
    m[key].push(r);
  }
  return m;
}
