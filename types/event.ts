export type EventState =
  | "draft"
  | "scheduled"
  | "ready"
  | "live"
  | "completed"
  | "replay";

export type RequirementKey =
  | "crew_assigned"
  | "ingest_configured"
  | "pricing_configured"
  // | "venue_confirmed"
  | "tech_check_done";

export interface ReadinessRequirement {
  key: RequirementKey;
  label: string;
  description: string;
  completed: boolean;
}

export interface EventAction {
  id: string;
  label: string;
  targetState: EventState;
  variant: "primary" | "danger" | "secondary";
  /** requirement keys that must all be completed before this action is allowed */
  requires: RequirementKey[];
}

// ─── Stream ingest ────────────────────────────────────────────────────────────

export type StreamSourceType =
  | "rtmp_obs"
  | "zoom"
  | "youtube_live"
  | "physical_irl"
  | "webcam";

export interface StreamIngestConfig {
  sourceType: StreamSourceType;
  rtmpUrl?: string;       // for rtmp_obs
  zoomMeetingId?: string; // for zoom
  youtubeStreamKey?: string; // for youtube_live
  venueAddress?: string;  // for physical_irl
  // webcam needs no extra config
}

// ─── Crew ─────────────────────────────────────────────────────────────────────

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  avatarInitials: string;
}

// ─── Tech check ───────────────────────────────────────────────────────────────

export type TechCheckItem =
  | "audio_check"
  | "video_check"
  | "latency_check"
  | "backup_stream"
  | "chat_moderation";

export interface TechCheckState {
  items: Record<TechCheckItem, boolean>;
  signedOffAt: string | null;
}

// ─── Extended event with config data ─────────────────────────────────────────

export interface LiveDotEvent {
  id: string;
  title: string;
  description: string;
  hostName: string;
  scheduledAt: string | null;
  ticketPrice: number | null;
  isFree: boolean;
  attendeeCount: number;
  state: EventState;
  requirements: ReadinessRequirement[];
  // Rich config — populated as host completes each requirement
  streamIngest: StreamIngestConfig | null;
  assignedCrew: CrewMember[];
  techCheck: TechCheckState;
  createdAt: string;
  updatedAt: string;
}