// app/warden/admission/page.tsx
import { getCurrentUser } from "@/lib/getCurrentUser";
import { redirect } from "next/navigation";
import AdmissionAdminPage from "./AdmissionAdminPage";

export default async function WardenAdmissionPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?error=Please log in first.");
  }

  if (user.role !== "warden") {
    redirect("/dashboard?error=Unauthorized access.");
  }

  return <AdmissionAdminPage />;
}
