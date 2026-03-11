"use client";

import { Modal } from "@/components/ui/Modal";
import { useUpdateTechCheckItem, useSignOffTechCheck } from "@/hooks/useEventQueries";
import { LiveDotEvent, TechCheckItem } from "@/types/event";
import { CheckCircle2, Circle, ShieldCheck } from "lucide-react";

interface TechCheckModalProps {
  event: LiveDotEvent;
  open: boolean;
  onClose: () => void;
}

const TECH_CHECK_ITEMS: Array<{ key: TechCheckItem; label: string; description: string }> = [
  { key: "audio_check",      label: "Audio check",         description: "Microphones tested, no feedback or clipping" },
  { key: "video_check",      label: "Video check",         description: "Camera/stream quality confirmed at target bitrate" },
  { key: "latency_check",    label: "Latency check",       description: "End-to-end stream delay measured and acceptable" },
  { key: "backup_stream",    label: "Backup stream ready", description: "Failover stream configured and tested" },
  { key: "chat_moderation",  label: "Chat moderation",     description: "Moderation tools set up, team briefed" },
];

export function TechCheckModal({ event, open, onClose }: TechCheckModalProps) {
  const { mutate: updateItem, isPending: isUpdating } = useUpdateTechCheckItem(event.id);
  const { mutate: signOff, isPending: isSigningOff }  = useSignOffTechCheck(event.id);

  const items = event.techCheck.items;
  const allChecked = Object.values(items).every(Boolean);
  const isSignedOff = !!event.techCheck.signedOffAt;
  const completedCount = Object.values(items).filter(Boolean).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tech Check"
      description="Verify all technical systems before going live."
      size="md"
    >
      <div className="space-y-3">
        {/* Progress bar */}
        <div>
          <div className="mb-1.5 flex justify-between text-xs text-zinc-500">
            <span>{completedCount} of {TECH_CHECK_ITEMS.length} items complete</span>
            {isSignedOff && (
              <span className="text-emerald-400">
                Signed off {new Date(event.techCheck.signedOffAt!).toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-linear-to-r from-amber-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${(completedCount / TECH_CHECK_ITEMS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2">
          {TECH_CHECK_ITEMS.map(({ key, label, description }) => {
            const checked = items[key];
            return (
              <button
                key={key}
                onClick={() => updateItem({ item: key, checked: !checked })}
                disabled={isUpdating || isSignedOff}
                className={`flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors disabled:cursor-not-allowed ${
                  checked
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-white/[0.07] bg-zinc-800/40 hover:border-white/12 hover:bg-zinc-800/70"
                }`}
              >
                {checked
                  ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
                }
                <div>
                  <p className={`text-sm font-medium ${checked ? "text-white" : "text-zinc-300"}`}>{label}</p>
                  <p className="text-xs text-zinc-500">{description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sign off */}
        {isSignedOff ? (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <p className="text-sm font-medium text-emerald-300">Tech check signed off</p>
          </div>
        ) : (
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
              Close
            </button>
            <button
              onClick={() => signOff(undefined, { onSuccess: onClose })}
              disabled={!allChecked || isSigningOff}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <ShieldCheck className="h-4 w-4" />
              {isSigningOff ? "Signing off…" : "Sign Off Tech Check"}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}