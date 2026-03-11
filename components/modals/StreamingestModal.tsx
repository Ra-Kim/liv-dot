"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useSetStreamIngest } from "@/hooks/useEventQueries";
import { LiveDotEvent, StreamSourceType, StreamIngestConfig } from "@/types/event";
import { Radio, Video, Youtube, MapPin, Camera } from "lucide-react";

interface StreamIngestModalProps {
  event: LiveDotEvent;
  open: boolean;
  onClose: () => void;
}

const SOURCES: Array<{
  type: StreamSourceType;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  { type: "rtmp_obs",     label: "RTMP / OBS",        description: "Stream via OBS or any RTMP encoder",  icon: <Radio className="h-4 w-4" /> },
  { type: "zoom",         label: "Zoom",               description: "Connect a Zoom meeting as source",    icon: <Video className="h-4 w-4" /> },
  { type: "youtube_live", label: "YouTube Live",       description: "Pull from a YouTube Live stream",     icon: <Youtube className="h-4 w-4" /> },
  { type: "physical_irl", label: "Physical / IRL",     description: "In-person event with on-site crew",   icon: <MapPin className="h-4 w-4" /> },
  { type: "webcam",       label: "Webcam (browser)",   description: "Stream directly from your browser",   icon: <Camera className="h-4 w-4" /> },
];

export function StreamIngestModal({ event, open, onClose }: StreamIngestModalProps) {
  const { mutate, isPending } = useSetStreamIngest(event.id);

  const existing = event.streamIngest;
  const [sourceType, setSourceType] = useState<StreamSourceType>(
    existing?.sourceType ?? "rtmp_obs"
  );
  const [rtmpUrl, setRtmpUrl]               = useState(existing?.rtmpUrl ?? "");
  const [zoomId, setZoomId]                 = useState(existing?.zoomMeetingId ?? "");
  const [ytKey, setYtKey]                   = useState(existing?.youtubeStreamKey ?? "");
  const [venueAddress, setVenueAddress]     = useState(existing?.venueAddress ?? "");
  const [error, setError] = useState("");

  function buildConfig(): StreamIngestConfig | null {
    switch (sourceType) {
      case "rtmp_obs":
        if (!rtmpUrl.startsWith("rtmp://")) { setError("Enter a valid RTMP URL (rtmp://…)"); return null; }
        return { sourceType, rtmpUrl };
      case "zoom":
        if (!zoomId.trim()) { setError("Enter a Zoom Meeting ID."); return null; }
        return { sourceType, zoomMeetingId: zoomId.trim() };
      case "youtube_live":
        if (!ytKey.trim()) { setError("Enter your YouTube stream key."); return null; }
        return { sourceType, youtubeStreamKey: ytKey.trim() };
      case "physical_irl":
        if (!venueAddress.trim()) { setError("Enter the venue address."); return null; }
        return { sourceType, venueAddress: venueAddress.trim() };
      case "webcam":
        return { sourceType };
    }
  }

  function handleSave() {
    setError("");
    const config = buildConfig();
    if (!config) return;
    mutate(config, { onSuccess: onClose });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Streaming Source"
      description="Choose how your stream will be delivered to viewers."
      size="md"
    >
      <div className="space-y-4">
        {/* Source type cards */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SOURCES.map((s) => (
            <button
              key={s.type}
              onClick={() => { setSourceType(s.type); setError(""); }}
              className={`flex items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
                sourceType === s.type
                  ? "border-amber-500/40 bg-amber-500/10 text-white"
                  : "border-white/[0.07] bg-zinc-800/50 text-zinc-400 hover:border-white/[0.14] hover:text-white"
              }`}
            >
              <span className={`mt-0.5 shrink-0 ${sourceType === s.type ? "text-amber-400" : "text-zinc-500"}`}>
                {s.icon}
              </span>
              <div>
                <p className="text-sm font-medium leading-tight">{s.label}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{s.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Conditional config */}
        <div className="min-h-15">
          {sourceType === "rtmp_obs" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">RTMP Ingest URL</label>
              <input
                value={rtmpUrl}
                onChange={(e) => { setRtmpUrl(e.target.value); setError(""); }}
                placeholder="rtmp://live.example.com/stream/your-key"
                className="w-full rounded-lg border border-white/8 bg-zinc-800 px-3 py-2.5 font-mono text-sm text-white placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              />
            </div>
          )}
          {sourceType === "zoom" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Zoom Meeting ID</label>
              <input
                value={zoomId}
                onChange={(e) => { setZoomId(e.target.value); setError(""); }}
                placeholder="812 3456 7890"
                className="w-full rounded-lg border border-white/8 bg-zinc-800 px-3 py-2.5 font-mono text-sm text-white placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              />
            </div>
          )}
          {sourceType === "youtube_live" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">YouTube Stream Key</label>
              <input
                value={ytKey}
                onChange={(e) => { setYtKey(e.target.value); setError(""); }}
                placeholder="xxxx-xxxx-xxxx-xxxx"
                className="w-full rounded-lg border border-white/8 bg-zinc-800 px-3 py-2.5 font-mono text-sm text-white placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              />
            </div>
          )}
          {sourceType === "physical_irl" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Venue Address</label>
              <input
                value={venueAddress}
                onChange={(e) => { setVenueAddress(e.target.value); setError(""); }}
                placeholder="123 Main St, Lagos, Nigeria"
                className="w-full rounded-lg border border-white/8 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              />
            </div>
          )}
          {sourceType === "webcam" && (
            <div className="rounded-lg border border-white/6 bg-zinc-800/50 px-3 py-3">
              <p className="text-sm text-zinc-400">
                No extra setup needed. Your browser camera will be used when you go live.
              </p>
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isPending ? "Saving…" : "Confirm Source"}
          </button>
        </div>
      </div>
    </Modal>
  );
}