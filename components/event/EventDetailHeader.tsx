"use client";

import { LiveDotEvent } from "@/types/event";
import { EventStatusBadge } from "./EventStatusBadge";
import { Calendar, Users, TicketIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EventDetailHeaderProps {
  event: LiveDotEvent;
}

function formatDate(iso: string | null): string {
  if (!iso) return "Not scheduled";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(iso));
}

function formatPrice(price: number | null): string {
  if (price === null) return "Not set";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
}

export function EventDetailHeader({ event }: EventDetailHeaderProps) {
  const isLive = event.state === "live";

  return (
    <div className="relative">
      {/* Live top bar */}
      {isLive && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
          <span className="font-mono text-xs font-medium text-red-400 uppercase tracking-widest">
            Streaming now
          </span>
          <span className="ml-auto font-mono text-xs text-red-400/60">
            {event.attendeeCount.toLocaleString()} watching
          </span>
        </div>
      )}

      {/* Back nav */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All events
      </Link>

      {/* Title row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2">
            <EventStatusBadge state={event.state} />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {event.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Hosted by{" "}
            <span className="text-zinc-300">{event.hostName}</span>
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
        {event.description}
      </p>

      {/* Meta strip */}
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/6 pt-6 text-sm text-zinc-500">
        <span className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-zinc-600" />
          {formatDate(event.scheduledAt)}
        </span>
        <span className="flex items-center gap-2">
          <TicketIcon className="h-4 w-4 text-zinc-600" />
          {formatPrice(event.ticketPrice)} per ticket
        </span>
        <span className="flex items-center gap-2">
          <Users className="h-4 w-4 text-zinc-600" />
          {event.attendeeCount.toLocaleString()} attendees
        </span>
      </div>
    </div>
  );
}