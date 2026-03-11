import Link from "next/link";
import { LiveDotEvent } from "@/types/event";
import { EventStatusBadge } from "./EventStatusBadge";
import { getReadinessProgress } from "@/lib/eventMachine";
import { Calendar, Users, TicketIcon, ArrowRight } from "lucide-react";

interface EventCardProps {
  event: LiveDotEvent;
}

function formatDate(iso: string | null): string {
  if (!iso) return "Not scheduled";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(iso));
}

function formatPrice(price: number | null): string {
  if (price === null) return "No pricing set";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
}

export function EventCard({ event }: EventCardProps) {
  const progress = getReadinessProgress(event);
  const isLive = event.state === "live";

  return (
    <Link href={`/events/${event.id}`} className="group block">
      <article className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-zinc-900/60 p-5 transition-all duration-200 hover:border-white/[0.14] hover:bg-zinc-900/90">
        {/* Live pulse stripe */}
        {isLive && (
          <span className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-linear-to-r from-transparent via-red-500 to-transparent" />
        )}

        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3
              style={{ fontFamily: "var(--font-syne), sans-serif" }}
              className="truncate text-base font-semibold text-white group-hover:text-zinc-100"
            >
              {event.title}
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500">{event.hostName}</p>
          </div>
          <EventStatusBadge state={event.state} size="sm" />
        </div>

        {/* Description */}
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-400">
          {event.description}
        </p>

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-zinc-600" />
            {formatDate(event.scheduledAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <TicketIcon className="h-3.5 w-3.5 text-zinc-600" />
            {formatPrice(event.ticketPrice)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-zinc-600" />
            {event.attendeeCount.toLocaleString()} attendees
          </span>
        </div>

        {/* Readiness bar — only show for states where it's relevant */}
        {(event.state === "draft" || event.state === "scheduled") && (
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs text-zinc-600">Readiness</span>
              <span style={{ fontFamily: "var(--font-dm-mono), monospace" }} className="text-xs text-zinc-500">{progress}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-linear-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Arrow */}
        <div className="mt-4 flex items-center justify-end">
          <span className="flex items-center gap-1 text-xs font-medium text-zinc-600 transition-colors group-hover:text-zinc-400">
            Manage
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </article>
    </Link>
  );
}