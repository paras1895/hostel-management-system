// app/warden/complaints/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import ComplaintsList from "@/app/components/ComplaintsList";

export default async function WardenComplaintsPage() {

  const user = await getCurrentUser();
  if (!user) {
    return <p className="p-6">Please log in.</p>;
  }
  if (user.role !== "warden") {
    return <p className="p-6">Unauthorized. Warden access required.</p>;
  }

  const complaints = await prisma.complaint.findMany({
    include: {
      student: {
        include: {
          room: {
            include: { block: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Complaints (All Students)</h1>
      </div>

      <ComplaintsList complaints={complaints} />
      
    </main>
  );
}
