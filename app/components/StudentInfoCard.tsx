"use client";

import ThemeWatcher from "./ThemeWatcher";

type Props = {
  student?: {
    id: number;
    mis: number;
    name: string;
    email: string;
    cgpa: number | string;
    verified?: boolean;
    createdAt: string | number | Date;
  };
};

function formatISTDate(value: string | number | Date) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export default function StudentInfoCard({ student }: Props) {
  if (!student) {
    return (
      <div className="bg-base-100 text-base-content p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Student Information</h2>
        <p className="text-base-content/60">No student data available.</p>
      </div>
    );
  }

  const joined = formatISTDate(student.createdAt);

  const { isDark } = ThemeWatcher();

  return (
    <div
      className={`${
        isDark ? "bg-gray-800" : "bg-white"
      } bg-base-100 text-base-content p-6 rounded-lg shadow-md relative"`}
    >
      {student.verified ? (
        <div className="w-15 mb-3 bg-green-500 text-white px-2 py-1 rounded text-sm">
          Verified
        </div>
      ) : (
        <div className="w-20 mb-3 bg-red-500 text-white px-2 py-1 rounded text-sm">
          Unverified
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Student Information</h2>
      <div className="space-y-2">
        <p>
          <strong>Name:</strong> {student.name}
        </p>
        <p>
          <strong>MIS:</strong> {student.mis}
        </p>
        <p>
          <strong>Email:</strong> {student.email}
        </p>
        <p>
          <strong>CGPA:</strong> {student.cgpa}
        </p>
        <p className="text-sm text-base-content/60">Joined: {joined}</p>
      </div>
    </div>
  );
}
