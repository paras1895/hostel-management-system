import { getCurrentUser } from "@/lib/getCurrentUser";
import { redirect } from "next/navigation";
import StudentDashboard from "./StudentDashboard";
import WardenDashboard from "./WardenDashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?error=Please log in first.");
  }

  if (user.role === "student") {
    return <StudentDashboard student={user.student} />;
  }

  if (user.role === "warden") {
    return <WardenDashboard warden={user.warden} />;
  }

  return <p className="p-8 text-center">Unknown user role.</p>;
}