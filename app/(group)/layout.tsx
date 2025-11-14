import type { Metadata } from "next";
import "@/globals.css";
import Sidebar from "@/app/components/SideBar";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Hostel Management Portal",
  description: "Unified layout for students and wardens",
};

export default async function GroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?error=Please log in to continue");
  }

  const role = user.role as "student" | "warden";

  return (
    <div className="flex h-screen bg-base-200 overflow-hidden">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}