// app/warden/students/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function WardenStudentsPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login?error=Please log in first.");
  if (user.role !== "warden") redirect("/dashboard?error=Unauthorized access.");

  // Fetch all students
  const students = await prisma.student.findMany({
    select: {
      id: true,
      name: true,
      mis: true,
      email: true,
      year: true,
      cgpa: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">🎓 All Students</h1>
      <table className="table table-zebra w-full mt-4 bg-base-100 shadow-lg rounded-lg">
        <thead>
          <tr>
            <th>Name</th>
            <th>MIS</th>
            <th>Email</th>
            <th>Year</th>
            <th>CGPA</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.mis}</td>
              <td>{s.email}</td>
              <td>{s.year}</td>
              <td>{s.cgpa}</td>
              <td>
                <Link
                  href={`/warden/students/${s.id}`}
                  className="btn btn-sm btn-outline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
