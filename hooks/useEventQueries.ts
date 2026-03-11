import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventService } from "@/lib/eventService";
import { queryKeys } from "@/lib/queryKeys";
import {
  EventState,
  LiveDotEvent,
  ReadinessRequirement,
  RequirementKey,
  StreamIngestConfig,
  CrewMember,
  TechCheckItem,
} from "@/types/event";

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useEvents() {
  return useQuery({
    queryKey: queryKeys.events.all,
    queryFn: () => eventService.getAll(),
    staleTime: 1000 * 30,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: queryKeys.events.detail(id),
    queryFn: () => eventService.getById(id),
    staleTime: 1000 * 30,
    enabled: !!id,
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function invalidateEvent(queryClient: ReturnType<typeof useQueryClient>, eventId: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
}

function optimisticUpdate(
  queryClient: ReturnType<typeof useQueryClient>,
  eventId: string,
  updater: (old: LiveDotEvent) => LiveDotEvent
) {
  const previous = queryClient.getQueryData<LiveDotEvent>(queryKeys.events.detail(eventId));
  queryClient.setQueryData<LiveDotEvent>(queryKeys.events.detail(eventId), (old) =>
    old ? updater(old) : old
  );
  return { previous };
}

// ─── State transition ─────────────────────────────────────────────────────────

export function useTransitionState(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetState: EventState) =>
      eventService.transitionState(eventId, targetState),
    onMutate: async (targetState) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.events.detail(eventId) });
      return optimisticUpdate(queryClient, eventId, (old) => ({ ...old, state: targetState }));
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(queryKeys.events.detail(eventId), context.previous);
    },
    onSettled: () => invalidateEvent(queryClient, eventId),
  });
}

// ─── Toggle requirement (raw checkbox) ───────────────────────────────────────

export function useToggleRequirement(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requirementKey, completed }: { requirementKey: RequirementKey; completed: boolean }) =>
      eventService.toggleRequirement(eventId, requirementKey, completed),
    onMutate: async ({ requirementKey, completed }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.events.detail(eventId) });
      return optimisticUpdate(queryClient, eventId, (old) => {
        const updatedRequirements = old.requirements.map((r: ReadinessRequirement) =>
          r.key === requirementKey ? { ...r, completed } : r
        );
        const shouldDemote = !completed && old.state === "ready";
        return { ...old, requirements: updatedRequirements, state: shouldDemote ? "scheduled" : old.state };
      });
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(queryKeys.events.detail(eventId), context.previous);
    },
    onSettled: () => invalidateEvent(queryClient, eventId),
  });
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export function useScheduleEvent(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scheduledAt: string) => eventService.scheduleEvent(eventId, scheduledAt),
    onMutate: async (scheduledAt) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.events.detail(eventId) });
      return optimisticUpdate(queryClient, eventId, (old) => ({
        ...old,
        scheduledAt,
        state: old.state === "draft" ? "scheduled" : old.state,
      }));
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(queryKeys.events.detail(eventId), context.previous);
    },
    onSettled: () => invalidateEvent(queryClient, eventId),
  });
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

export function useSetPricing(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketPrice, isFree }: { ticketPrice: number | null; isFree: boolean }) =>
      eventService.setPricing(eventId, ticketPrice, isFree),
    onMutate: async ({ ticketPrice, isFree }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.events.detail(eventId) });
      return optimisticUpdate(queryClient, eventId, (old) => {
        const completed = isFree || (ticketPrice !== null && ticketPrice >= 0);
        const shouldDemote = !completed && old.state === "ready";
        return {
          ...old,
          ticketPrice: isFree ? 0 : ticketPrice,
          isFree,
          requirements: old.requirements.map((r) =>
            r.key === "pricing_configured" ? { ...r, completed } : r
          ),
          state: shouldDemote ? "scheduled" : old.state,
        };
      });
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(queryKeys.events.detail(eventId), context.previous);
    },
    onSettled: () => invalidateEvent(queryClient, eventId),
  });
}

// ─── Stream ingest ────────────────────────────────────────────────────────────

export function useSetStreamIngest(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: StreamIngestConfig) => eventService.setStreamIngest(eventId, config),
    onMutate: async (config) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.events.detail(eventId) });
      return optimisticUpdate(queryClient, eventId, (old) => ({
        ...old,
        streamIngest: config,
        requirements: old.requirements.map((r) =>
          r.key === "ingest_configured" ? { ...r, completed: true } : r
        ),
      }));
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(queryKeys.events.detail(eventId), context.previous);
    },
    onSettled: () => invalidateEvent(queryClient, eventId),
  });
}

// ─── Crew ─────────────────────────────────────────────────────────────────────

export function useSetCrew(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (crew: CrewMember[]) => eventService.setCrew(eventId, crew),
    onMutate: async (crew) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.events.detail(eventId) });
      return optimisticUpdate(queryClient, eventId, (old) => {
        const completed = crew.length > 0;
        const shouldDemote = !completed && old.state === "ready";
        return {
          ...old,
          assignedCrew: crew,
          requirements: old.requirements.map((r) =>
            r.key === "crew_assigned" ? { ...r, completed } : r
          ),
          state: shouldDemote ? "scheduled" : old.state,
        };
      });
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(queryKeys.events.detail(eventId), context.previous);
    },
    onSettled: () => invalidateEvent(queryClient, eventId),
  });
}

// ─── Tech check ───────────────────────────────────────────────────────────────

export function useUpdateTechCheckItem(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ item, checked }: { item: TechCheckItem; checked: boolean }) =>
      eventService.updateTechCheckItem(eventId, item, checked),
    onMutate: async ({ item, checked }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.events.detail(eventId) });
      return optimisticUpdate(queryClient, eventId, (old) => ({
        ...old,
        techCheck: {
          ...old.techCheck,
          items: { ...old.techCheck.items, [item]: checked },
          signedOffAt: null,
        },
      }));
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(queryKeys.events.detail(eventId), context.previous);
    },
    onSettled: () => invalidateEvent(queryClient, eventId),
  });
}

export function useSignOffTechCheck(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => eventService.signOffTechCheck(eventId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.events.detail(eventId) });
      return optimisticUpdate(queryClient, eventId, (old) => ({
        ...old,
        techCheck: { ...old.techCheck, signedOffAt: new Date().toISOString() },
        requirements: old.requirements.map((r) =>
          r.key === "tech_check_done" ? { ...r, completed: true } : r
        ),
      }));
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(queryKeys.events.detail(eventId), context.previous);
    },
    onSettled: () => invalidateEvent(queryClient, eventId),
  });
}