"use client";

// pages/dashboard.tsx
import { useState } from 'react';
import type { NextPage } from 'next';

// Mock data types
interface Student {
  name: string;
  rollNo: string;
  roomNo: string;
  year: string;
  course: string;
  contact: string;
  verified: boolean;
}

interface Roommate {
  name: string;
  roomNo: string;
  avatar: string; // Placeholder for avatar URL or initials
}

interface Notification {
  id: number;
  message: string;
  date: string;
}

interface Complaint {
  id: number;
  summary: string;
  status: 'Pending' | 'Resolved' | 'In Progress';
}

interface Update {
  id: number;
  title: string;
  description: string;
  date: string;
}

// Mock data
const student: Student = {
  name: 'John Doe',
  rollNo: '12345',
  roomNo: 'A-101',
  year: '3rd Year',
  course: 'Computer Science',
  contact: '+1-234-567-890',
  verified: true,
};

const roommates: Roommate[] = [
  { name: 'Alice Smith', roomNo: 'A-101', avatar: 'AS' },
  { name: 'Bob Johnson', roomNo: 'A-101', avatar: 'BJ' },
  { name: 'Charlie Brown', roomNo: 'A-101', avatar: 'CB' },
];

const notifications: Notification[] = [
  { id: 1, message: 'Room cleaning scheduled for tomorrow.', date: '2023-10-01' },
  { id: 2, message: 'New hostel rules updated.', date: '2023-09-28' },
  { id: 3, message: 'WiFi maintenance tonight.', date: '2023-09-27' },
];

const complaints: Complaint[] = [
  { id: 1, summary: 'Leaky faucet in bathroom.', status: 'In Progress' },
  { id: 2, summary: 'Broken light in common area.', status: 'Resolved' },
];

const updates: Update[] = [
  { id: 1, title: 'Hostel Fest', description: 'Annual hostel festival on Oct 15th.', date: '2023-10-15' },
  { id: 2, title: 'Maintenance', description: 'Electrical work in Block A.', date: '2023-10-05' },
];

const Dashboard: NextPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}>
        <div className="flex items-center justify-center h-16 bg-blue-600 text-white font-bold text-xl">
          Hostel MS
        </div>
        <nav className="mt-10">
          <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">Dashboard</a>
          <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">Students</a>
          <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">Rooms</a>
          <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">Complaints</a>
          <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">Notifications</a>
          <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">Settings</a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white shadow-md md:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Student Info Card */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{student.name}</h2>
                <span className={`absolute top-0 right-0 px-2 py-1 text-xs font-semibold rounded-full ${student.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {student.verified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <div className="space-y-2">
                <p><strong>Roll No:</strong> {student.rollNo}</p>
                <p><strong>Room No:</strong> {student.roomNo}</p>
                <p><strong>Year:</strong> {student.year}</p>
                <p><strong>Course:</strong> {student.course}</p>
                <p><strong>Contact:</strong> {student.contact}</p>
              </div>
            </div>

            {/* Roommates Section */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Roommates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {roommates.map((roommate, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      {roommate.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{roommate.name}</p>
                      <p className="text-sm text-gray-600">Room {roommate.roomNo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h3>
              <ul className="space-y-2">
                {notifications.map((notif) => (
                  <li key={notif.id} className="text-sm text-gray-700">
                    <p>{notif.message}</p>
                    <p className="text-xs text-gray-500">{notif.date}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Complaints */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Complaints</h3>
              <ul className="space-y-2">
                {complaints.map((complaint) => (
                  <li key={complaint.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm">{complaint.summary}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' : complaint.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {complaint.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* General Updates */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Hostel Updates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {updates.map((update) => (
                  <div key={update.id} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold">{update.title}</h4>
                    <p className="text-sm text-gray-700">{update.description}</p>
                    <p className="text-xs text-gray-500">{update.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
