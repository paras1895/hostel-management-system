"use client";
import ThemeWatcher from "./ThemeWatcher";

type Props = {
  student?: any;
};

export default function StudentInfoCard({ student }: Props) {
  const { theme, isDark } = ThemeWatcher();

  // 🧠 If no student data, show a simple message
  if (!student) {
    return (
      <div
        className={`${isDark ? "bg-gray-800" : "bg-white"} text-base-content p-6 rounded-lg shadow-md`}
      >
        <h2 className="text-xl font-semibold mb-2 text-base-content">Student Information</h2>
        <p className="text-gray-500">No student data available.</p>
      </div>
    );
  }

  // ✅ Safe to access student fields now
  return (
    <div
      className={`${isDark ? "bg-gray-800" : "bg-white"} text-base-content p-6 rounded-lg shadow-md relative`}
    >
      {student.verified && (
        <span className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-sm">
          Verified
        </span>
      )}

      <h2 className="text-xl font-semibold mb-4 text-base-content">Student Information</h2>
      <div className="space-y-2">
        <p><strong>Name:</strong> {student.name}</p>
        <p><strong>MIS:</strong> {student.mis}</p>
        <p><strong>Email:</strong> {student.email}</p>
        <p><strong>CGPA:</strong> {student.cgpa}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Joined: {new Date(student.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}