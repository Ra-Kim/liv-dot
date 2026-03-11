"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useScheduleEvent } from "@/hooks/useEventQueries";
import { LiveDotEvent } from "@/types/event";
import { Calendar } from "lucide-react";
import dayjs from "dayjs";

interface ScheduleModalProps {
  event: LiveDotEvent;
  open: boolean;
  onClose: () => void;
}

export function ScheduleModal({ event, open, onClose }: ScheduleModalProps) {
  const { mutate, isPending } = useScheduleEvent(event.id);

  // Pre-fill with existing value if set
  const existingDate = event.scheduledAt
    ? new Date(event.scheduledAt).toISOString().slice(0, 16)
    : "";

  const [dateTime, setDateTime] = useState(existingDate);
  const [error, setError] = useState("");

  function handleSave() {
    if (!dateTime) { setError("Please select a date and time."); return; }
    const selected = new Date(dateTime);
    if (selected <= new Date()) { setError("Scheduled time must be in the future."); return; }
    setError("");
    mutate(selected.toISOString(), { onSuccess: onClose });
  }

  // Min = now (rounded to next minute)
  const minDateTime = dayjs().add(1, "minute").toISOString().slice(0, 16);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Schedule Event"
      description="Set the date and time your event will go live."
      size="sm"
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Date &amp; Time
          </label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="datetime-local"
              value={dateTime}
              min={minDateTime}
              onChange={(e) => { setDateTime(e.target.value); setError(""); }}
              className="w-full rounded-lg border border-white/8 bg-zinc-800 py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 scheme-dark"
            />
          </div>
          {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
        </div>

        {dateTime && !error && (
          <div className="rounded-lg border border-white/6 bg-zinc-800/50 px-3 py-2.5">
            <p className="text-xs text-zinc-500">Scheduled for</p>
            <p className="mt-0.5 font-mono text-sm text-white">
              {new Intl.DateTimeFormat("en-GB", {
                weekday: "long", day: "numeric", month: "long",
                year: "numeric", hour: "2-digit", minute: "2-digit",
              }).format(new Date(dateTime))}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || !dateTime}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isPending ? "Saving…" : "Save Schedule"}
          </button>
        </div>
      </div>
    </Modal>
  );
}