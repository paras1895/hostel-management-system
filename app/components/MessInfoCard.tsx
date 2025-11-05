"use client";

import ThemeWatcher from "./ThemeWatcher";

interface Mess {
  name: string;
  capacity: number;
  menu: { today: string[] };
}

interface Props {
  mess: Mess;
}

export default function MessInfoCard({ mess }: Props) {
  const { theme, isDark } = ThemeWatcher();

  return (
    <div
      className={`${
        isDark ? "bg-gray-800" : "bg-white"
      } text-base-content p-6 rounded-lg shadow-md relative`}
    >
      <h2 className="text-xl font-semibold mb-4 text-base-content">
        Mess Information
      </h2>
      <p>
        <strong>Name:</strong> {mess.name}
      </p>
      <p>
        <strong>Capacity:</strong> {mess.capacity}
      </p>
      <h3 className="mt-4 font-medium">Today's Menu:</h3>
      <ul className="list-disc list-inside space-y-1">
        {mess.menu.today.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
