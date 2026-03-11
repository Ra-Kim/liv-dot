"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useSetCrew } from "@/hooks/useEventQueries";
import { LiveDotEvent, CrewMember } from "@/types/event";
import { MOCK_CREW_ROSTER } from "@/lib/mockCrew";
import { Plus, X, Users } from "lucide-react";

interface CrewModalProps {
  event: LiveDotEvent;
  open: boolean;
  onClose: () => void;
}

export function CrewModal({ event, open, onClose }: CrewModalProps) {
  const { mutate, isPending } = useSetCrew(event.id);
  const [assigned, setAssigned] = useState<CrewMember[]>(event.assignedCrew ?? []);

  const assignedIds = new Set(assigned.map((c) => c.id));
  const available = MOCK_CREW_ROSTER.filter((c) => !assignedIds.has(c.id));

  function add(member: CrewMember) {
    setAssigned((prev) => [...prev, member]);
  }

  function remove(id: string) {
    setAssigned((prev) => prev.filter((c) => c.id !== id));
  }

  function handleSave() {
    mutate(assigned, { onSuccess: onClose });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Production Crew"
      description="Assign crew members to this event."
      size="md"
    >
      <div className="space-y-4">
        {/* Assigned */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-400">Assigned</span>
            <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-500">
              {assigned.length}
            </span>
          </div>

          {assigned.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/8 py-4 text-center">
              <Users className="mx-auto mb-1.5 h-5 w-5 text-zinc-600" />
              <p className="text-xs text-zinc-600">No crew assigned yet</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {assigned.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-lg border border-white/6 bg-zinc-800/50 px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 font-mono text-xs font-semibold text-amber-300">
                    {member.avatarInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{member.name}</p>
                    <p className="text-xs text-zinc-500">{member.role}</p>
                  </div>
                  <button
                    onClick={() => remove(member.id)}
                    className="rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-700 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available roster */}
        {available.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-zinc-400">Available crew</p>
            <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
              {available.map((member) => (
                <button
                  key={member.id}
                  onClick={() => add(member)}
                  className="flex w-full items-center gap-3 rounded-lg border border-white/6 bg-zinc-800/30 px-3 py-2.5 text-left transition-colors hover:border-white/12 hover:bg-zinc-800"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 font-mono text-xs font-semibold text-zinc-300">
                    {member.avatarInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{member.name}</p>
                    <p className="text-xs text-zinc-500">{member.role}</p>
                  </div>
                  <Plus className="h-4 w-4 shrink-0 text-zinc-600" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isPending ? "Saving…" : "Save Crew"}
          </button>
        </div>
      </div>
    </Modal>
  );
}