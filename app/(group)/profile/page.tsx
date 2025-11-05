// app/profile/page.tsx
import { getCurrentUser } from "@/lib/getCurrentUser";
import { redirect } from "next/navigation";
import StudentInfoCard from "@/components/StudentInfoCard";
import RoomInfoCard from "@/components/RoomInfoCard";
import StudentUpdateForm from "@/components/StudentUpdateForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login?error=Please log in first.");
  if (!user?.student) return <p className="p-6 text-center">No student profile found.</p>;

  const student = user.student;

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Existing cards */}
      <StudentInfoCard student={student} />
      <RoomInfoCard room={student.room as any} />

      {/* New update form */}
      <div className="card bg-base-200 shadow p-6">
        <h2 className="text-xl font-bold mb-4">Update Profile</h2>
        <StudentUpdateForm initialData={student} />
      </div>
    </div>
  );
}
