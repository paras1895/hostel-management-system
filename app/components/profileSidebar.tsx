import Link from 'next/link';

export default function profileSidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Hostel Management</h1>
      <nav className="space-y-4">
        <Link href="/dashboard" className="block text-gray-700 dark:text-gray-300 hover:text-blue-500">Dashboard</Link>
        <Link href="/profile" className="block text-gray-700 dark:text-gray-300 hover:text-blue-500">Profile</Link>
        <Link href="/payments" className="block text-gray-700 dark:text-gray-300 hover:text-blue-500">Payments</Link>
        <Link href="/complaints" className="block text-gray-700 dark:text-gray-300 hover:text-blue-500">Complaints</Link>
        <Link href="/settings" className="block text-gray-700 dark:text-gray-300 hover:text-blue-500">Settings</Link>
        <button className="block text-gray-700 dark:text-gray-300 hover:text-red-500">Logout</button>
      </nav>
    </aside>
  );
}