import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LogoutButton from '../components/LogoutButton';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: parseInt(token) } });

  return (
    <div className="p-8 flex flex-col items-start gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <LogoutButton />
    </div>
  );
}