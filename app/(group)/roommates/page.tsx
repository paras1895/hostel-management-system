// app/(group)/roommates/page.tsx
import { getCurrentUser } from "@/lib/getCurrentUser";
import {
  getAvailableStudentsForInvite,
  getMyInvites,
  getMyRoomAndMembers,
} from "@/lib/roommates";
import InviteCard from "./InviteCard";
import CandidateCard from "./CandidateCard";
import LeaveRoomButton from "./LeaveRoomButton";

export default async function RoommatesPage() {
  const user = await getCurrentUser();
  if (!user?.student) {
    return <div className="p-6">Please sign in as a student.</div>;
  }

  const [me, invites, available] = await Promise.all([
    getMyRoomAndMembers(user.student.id),
    getMyInvites(user.student.id),
    getAvailableStudentsForInvite(user.student.id),
  ]);

  const myRoom = me?.room;

  return (
    <div className="p-6 space-y-10">
      <section>
        <h2 className="text-2xl font-bold mb-3">Your group</h2>
        {myRoom ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {myRoom.students.map((s) => (
                <div key={s.id} className="card bg-base-200 shadow">
                  <div className="card-body">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm opacity-70">{s.email}</div>
                    <div className="text-xs mt-2">
                      Year: {s.year} • CGPA: {s.cgpa}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm opacity-70">
              {myRoom._count.students}/{myRoom.capacity} filled
            </div>
            <div className="mt-3">
              <LeaveRoomButton />
            </div>
          </>
        ) : (
          <div className="alert">
            You aren't in a room yet. Once you accept an invite, you'll be
            placed into that group.
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">Invites for you</h2>
        {invites.length === 0 ? (
          <div className="text-sm opacity-70">No pending invites.</div>
        ) : (
          <div className="space-y-3">
            {invites.map((inv, idx) => (
              <InviteCard
                key={
                  inv.id ??
                  inv.inviteId ??
                  `${inv.fromStudentId ?? "from"}-${
                    inv.roomId ?? "room"
                  }-${idx}`
                }
                invite={inv}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">Available students</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {available.map((c) => (
            <CandidateCard key={c.id} candidate={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
