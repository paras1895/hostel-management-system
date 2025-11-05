"use client";

type WardenDashboardProps = {
  warden: any;
};

export default function WardenDashboard({ warden }: WardenDashboardProps) {
  return (
    <main className="flex-1 p-8 space-y-8 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">🏢 Warden Dashboard</h1>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <p>
            <strong>Name:</strong> {warden.name}
          </p>
          <p>
            <strong>Email:</strong> {warden.email}
          </p>
          <p>
            <strong>Phone:</strong> {warden.phone || "N/A"}
          </p>
        </div>
      </div>

      {warden.block ? (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Block Details</h2>
            <p>
              <strong>Block Name:</strong> {warden.block.name}
            </p>

            <h3 className="mt-4 font-semibold">Rooms:</h3>
            <ul className="list-disc pl-6">
              {warden.block.rooms?.length ? (
                warden.block.rooms.map((room: any) => (
                  <li key={room.id}>
                    Room {room.roomNumber} — Capacity: {room.capacity}
                  </li>
                ))
              ) : (
                <li>No rooms found.</li>
              )}
            </ul>
          </div>
        </div>
      ) : (
        <p>No block assigned.</p>
      )}
    </main>
  );
}
