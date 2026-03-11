"use client";

import { use } from "react";
import { useEvent } from "@/hooks/useEventQueries";
import { EventDetailHeader } from "@/components/event/EventDetailHeader";
import { StateTimeline } from "@/components/event/Statetimeline";
import { ReadinessChecklist } from "@/components/event/ReadinessChecklist";
import { ActionPanel } from "@/components/event/ActionPanel";
import { EventDetailSkeleton } from "@/components/event/EventDetailSkeleton";
import { RequirementModals, useRequirementModal } from "@/components/modals/RequirementModal";
import { Radio, AlertCircle } from "lucide-react";
import Link from "next/link";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = use(params);
  const { data: event, isLoading, isError } = useEvent(id);
  const { activeModal, openModal, closeModal } = useRequirementModal();

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-white/6 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-amber-500/20">
              <Radio className="h-4 w-4 text-amber-400" />
            </div>
            <span className="font-display text-sm font-semibold tracking-tight text-white">
              LIV<span className="text-amber-400">.</span>
            </span>
          </Link>

          {event && (
            <span className="font-mono text-xs text-zinc-600">{event.id}</span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {isLoading && <EventDetailSkeleton />}

        {isError && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <AlertCircle className="mb-3 h-8 w-8 text-red-500/60" />
            <p className="text-sm font-medium text-red-400">Event not found</p>
            <p className="mt-1 text-xs text-zinc-600">
              This event may have been removed or the link is invalid.
            </p>
            <Link
              href="/"
              className="mt-6 rounded-lg bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              Back to dashboard
            </Link>
          </div>
        )}

        {!isLoading && !isError && event && (
          <>
            <div className="space-y-8">
              {/* Header: title, status, meta */}
              <EventDetailHeader event={event} />

              {/* Lifecycle timeline */}
              <StateTimeline currentState={event.state} />

              {/* Checklist + Actions */}
              <div className="grid gap-4 lg:grid-cols-2">
                <ReadinessChecklist
                  event={event}
                  onOpenModal={openModal}
                />
                <ActionPanel event={event} />
              </div>
            </div>

            {/* All modals — rendered outside the layout flow, controlled by useRequirementModal */}
            <RequirementModals
              event={event}
              activeModal={activeModal}
              onClose={closeModal}
            />
          </>
        )}
      </main>
    </div>
  );
}