"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import ThemeWatcher from "../../components/ThemeWatcher";

type RoomItem = {
  id: number;
  roomNumber: string;
  blockName: string | null;
  roomCode: string;
  capacity: number | null;
  groupYear: string | null;
};

function normalizeCode(s: string) {
  return String(s ?? "").trim().toUpperCase();
}

export default function PreferencesPage() {
  const [availableRooms, setAvailableRooms] = useState<RoomItem[]>([]);
  const [prefList, setPrefList] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState<{ ok?: boolean; text: string } | null>(null);
  const [loading, start] = useTransition();
  const [readonlyInfo, setReadonlyInfo] = useState<{ readonly: boolean; submittedBy?: number | null } | null>(null);

  const [inProvisional, setInProvisional] = useState<boolean | null>(null);
  const [tempRoom, setTempRoom] = useState<{ id: number; roomNumber: string; capacity: number; currentOccupancy: number } | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const { isDark } = ThemeWatcher();

  useEffect(() => {
    async function load() {
      try {
        const [r1, r2] = await Promise.all([
          fetch("/api/admission/rooms").then((r) => r.json()).catch(() => null),
          fetch("/api/admission/preferences").then((r) => r.json()).catch(() => null),
        ]);

        if (!r1 || !r1.rooms) {
          setAvailableRooms([]);
        } else {
          const rooms = r1.rooms.map((x: any) => ({
            ...x,
            roomCode: String(x.roomCode ?? `${x.blockShort ?? ""}-${x.roomNumber}`).trim().toUpperCase(),
          }));
          setAvailableRooms(rooms);
        }

        if (r2) {
          if (r2.inProvisional === false) {
            setInProvisional(false);
            setTempRoom(null);
            setReadonlyInfo(null);
          } else {
            setInProvisional(true);
            if (r2.tempRoom) {
              setTempRoom({
                id: r2.tempRoom.id,
                roomNumber: r2.tempRoom.roomNumber,
                capacity: r2.tempRoom.capacity,
                currentOccupancy: r2.tempRoom.currentOccupancy,
              });
            }
            if (r2.exists) {
              setPrefList(Array.isArray(r2.preference) ? r2.preference.map((p: string) => p.trim().toUpperCase()) : []);
              setReadonlyInfo({ readonly: false, submittedBy: r2.submittedBy ?? null }); // server enforces submitter check
            } else {
              setPrefList([]);
              setReadonlyInfo({ readonly: false });
            }
          }
        }
      } catch (err) {
        console.error("load error", err);
        setMessage({ ok: false, text: "Failed to load preferences UI data." });
      }
    }
    load();
  }, []);

  const validCodes = useMemo(
    () => new Set(availableRooms.map((r) => String(r.roomCode).trim().toUpperCase())),
    [availableRooms]
  );

  function addCode(codeRaw?: string) {
    const code = normalizeCode(codeRaw ?? input);
    if (!code) return;
    if (!validCodes.has(code)) {
      setMessage({ ok: false, text: `Room ${code} is not valid (choose from suggestions).` });
      return;
    }
    if (prefList.includes(code)) {
      setMessage({ ok: false, text: `${code} is already in your list.` });
      return;
    }
    setPrefList((p) => [...p, code]);
    setInput("");
    setMessage(null);
    inputRef.current?.focus();
  }

  function removeAt(idx: number) {
    setPrefList((p) => p.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    setPrefList((p) => {
      const arr = [...p];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return arr;
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      return arr;
    });
  }

  const dragIndex = useRef<number | null>(null);
  function onDragStart(e: React.DragEvent, idx: number) {
    dragIndex.current = idx;
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }
  function onDrop(e: React.DragEvent, idx: number) {
    e.preventDefault();
    const from = dragIndex.current;
    if (from == null) return;
    setPrefList((p) => {
      const arr = [...p];
      const [val] = arr.splice(from, 1);
      arr.splice(idx, 0, val);
      return arr;
    });
    dragIndex.current = null;
  }

  async function requestProvisionalRoom() {
    if (!confirm("Request a provisional room now?")) return;
    start(async () => {
      try {
        const res = await fetch("/api/room/request", { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert(data?.error || `Failed to request provisional room (status ${res.status})`);
          return;
        }
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("Network error requesting provisional room.");
      }
    });
  }

  async function submit() {
    start(async () => {
      setMessage(null);
      if (prefList.length === 0) {
        setMessage({ ok: false, text: "Please add at least one room to your preference list." });
        return;
      }

      if (!tempRoom) {
        setMessage({ ok: false, text: "You are not in a provisional room." });
        return;
      }
      if (tempRoom.currentOccupancy < tempRoom.capacity) {
        setMessage({ ok: false, text: `Your provisional room is not full yet (${tempRoom.currentOccupancy}/${tempRoom.capacity}).` });
        return;
      }

      try {
        const res = await fetch("/api/admission/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preferences: prefList }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setMessage({ ok: false, text: data?.error || `Failed to save preferences (status ${res.status}).` });
          return;
        }
        setMessage({ ok: true, text: `Saved ${data.count ?? prefList.length} preferences.` });
        setReadonlyInfo((r) => ({ ...(r ?? {}), readonly: true }));
      } catch (err) {
        console.error(err);
        setMessage({ ok: false, text: "Network error." });
      }
    });
  }

  const suggestions = useMemo(() => availableRooms.map((r) => r.roomCode), [availableRooms]);

  return (
    <div className={`${isDark ? "bg-gray-800" : "bg-white"} p-6 max-w-3xl mx-auto space-y-4`}>
      <h1 className="text-2xl font-bold">Submit Room Preferences</h1>

      <div className="alert my-6">
        <div>
          Only <b>one member</b> of your provisional (TEMP) group should submit the list.
          Use the suggestions below — typing arbitrary values is disabled. Preferences can be submitted only once the provisional room is full.
        </div>
      </div>

      {inProvisional === false && (
        <div className="card bg-base-100 shadow p-4">
          <div className="font-medium mb-2">You are not in a provisional room yet</div>
          <div className="text-sm opacity-70 mb-4">
            To submit preferences you must first join/request a provisional room. One provisional room collects up to {4} members.
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={requestProvisionalRoom}>Request provisional room</button>
            <button className="btn btn-ghost" onClick={() => window.location.reload()}>Refresh</button>
          </div>
        </div>
      )}

      {inProvisional === true && tempRoom && tempRoom.currentOccupancy < tempRoom.capacity && (
        <div className="card bg-yellow-50 border border-yellow-200 p-4">
          <div className="font-medium">Your provisional room: {tempRoom.roomNumber}</div>
          <div className="text-sm opacity-70 mb-2">Current occupancy: {tempRoom.currentOccupancy}/{tempRoom.capacity}</div>
          <div className="text-sm">
            You can prepare a preference list, but submission will be blocked until the room is full (all {tempRoom.capacity} members have joined).
          </div>
        </div>
      )}

      {inProvisional === true && tempRoom && tempRoom.currentOccupancy >= tempRoom.capacity && (
        <div className="card bg-base-100 shadow">
          <div className="card-body space-y-3">
            <label className="label">
              <span className="label-text">Add a room (choose from suggestions):</span>
            </label>

            <div className="flex gap-2">
              <input
                ref={inputRef}
                className="input input-bordered flex-1"
                placeholder="Start typing block or code (e.g. A-101)"
                list="room-suggestions"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={readonlyInfo?.readonly}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCode();
                  }
                }}
              />
              <datalist id="room-suggestions">
                {suggestions.map((s) => <option key={s} value={s} />)}
              </datalist>
              <button className="btn" onClick={() => addCode()} disabled={readonlyInfo?.readonly}>Add</button>
            </div>
            <div className="text-sm opacity-70">Tip: choose from the dropdown list; only valid rooms are accepted.</div>

            <div>
              <div className="font-semibold mb-1">Your preference order ({prefList.length}):</div>

              {prefList.length === 0 ? (
                <div className="opacity-60">Nothing added yet.</div>
              ) : (
                <ul className="space-y-2">
                  {prefList.map((p, i) => (
                    <li
                      key={p + "-" + i}
                      draggable={!readonlyInfo?.readonly}
                      onDragStart={(e) => onDragStart(e, i)}
                      onDragOver={onDragOver}
                      onDrop={(e) => onDrop(e, i)}
                      className="flex items-center gap-3 p-2 bg-base-200 rounded"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{p}</div>
                        <div className="text-xs opacity-70">
                          {availableRooms.find(r => r.roomCode === p)?.blockName ?? ""}
                          {" • "}
                          Room #{availableRooms.find(r => r.roomCode === p)?.roomNumber ?? ""}
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <button title="Move up" className="btn btn-xs" onClick={() => move(i, -1)} disabled={i === 0 || readonlyInfo?.readonly}>↑</button>
                        <button title="Move down" className="btn btn-xs" onClick={() => move(i, 1)} disabled={i === prefList.length - 1 || readonlyInfo?.readonly}>↓</button>
                        <button title="Remove" className="btn btn-xs btn-ghost" onClick={() => removeAt(i)} disabled={readonlyInfo?.readonly}>✕</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {message && <div className={`text-sm ${message.ok ? "text-success" : "text-error"}`}>{message.text}</div>}

            <div className="card-actions justify-end">
              <button className="btn btn-primary" onClick={submit} disabled={loading || readonlyInfo?.readonly}>
                {loading ? "Saving..." : "Save Preferences"}
              </button>
            </div>

            {readonlyInfo?.submittedBy ? (
              <div className="text-xs opacity-70 mt-2">Preferences submitted by student ID: {readonlyInfo.submittedBy}. Only that student may edit.</div>
            ) : null}
          </div>
        </div>
      )}

      <div className="text-sm opacity-70 mt-3">
        After the warden runs the allocation, you'll see your assigned room on the dashboard.
      </div>
    </div>
  );
}