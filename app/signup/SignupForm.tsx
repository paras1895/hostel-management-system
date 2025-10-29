'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) router.push('/dashboard');
    else {
      const data = await res.json();
      alert(data.message || 'Signup failed');
    }
  };

  return (
    <form
      onSubmit={handleSignup}
      className="flex flex-col gap-4 p-8 max-w-md mx-auto"
    >
      <h1 className="text-2xl font-bold">Signup</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <button type="submit" className="bg-green-500 text-white p-2 rounded">
        Signup
      </button>
    </form>
  );
}