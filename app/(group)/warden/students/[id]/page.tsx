// app/(group)/warden/students/[id]/page.tsx
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Link from "next/link";

export default async function WardenStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap params
  const { id } = await params;

  if (!id) {
    redirect("/warden/students?error=Missing student ID");
  }

  const studentId = Number(id);
  if (!Number.isFinite(studentId)) {
    redirect("/warden/students?error=Invalid student ID");
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login?error=Please log in first.");
  if (user.role !== "warden") redirect("/dashboard?error=Unauthorized access.");

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      room: { include: { block: true } },
      payments: true,
      complaints: true,
    },
  });

  if (!student) {
    return <p className="p-6">Student not found.</p>;
  }

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">🎓 {student.name}</h1>

      <div className="card bg-base-100 shadow p-6 space-y-2">
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
        <p>
          <strong>Gender:</strong> {student.gender}
        </p>
        {student.room ? (
          <p>
            <strong>Room:</strong> {student.room.roomNumber} (
            {student.room.block.name})
          </p>
        ) : (
          <p>
            <strong>Room:</strong> Not assigned
          </p>
        )}
      </div>

      <form action={`/api/students/${student.id}/toggle-verify`} method="POST">
        <button className="btn btn-primary">
          {student.verified ? "Unverify" : "Verify"} Student
        </button>
      </form>

      {/* Complaints List */}
      <div className="card bg-base-100 shadow p-6 space-y-3">
        <h3 className="text-xl font-semibold">Complaints</h3>
        {student.complaints.length ? (
          <ul className="space-y-3">
            {student.complaints.map((c) => (
              <li
                key={c.id}
                className="flex justify-between items-center bg-base-200 p-3 rounded-md"
              >
                <div>
                  <p className="font-medium">{c.message}</p>
                  <p className="text-xs opacity-70">
                    Status:{" "}
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
                {c.status !== "Resolved" && (
                  <form action={`/api/complaints/resolve`} method="POST">
                    <input type="hidden" name="complaintId" value={c.id} />
                    <button type="submit" className="btn btn-sm btn-success">
                      Mark Resolved
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No complaints filed.</p>
        )}
      </div>

      <Link href="/warden/students" className="btn btn-outline">
        ⬅ Back to Students
      </Link>
    </main>
  );
}
