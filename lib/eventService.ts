import { LiveDotEvent, EventState, RequirementKey, StreamIngestConfig, CrewMember, TechCheckItem } from "@/types/event";
import { MOCK_EVENTS } from "./mockData";
import { STATE_TRANSITIONS } from "./eventMachine";

// In-memory store — simulates a backend DB for the session
const eventStore: LiveDotEvent[] = structuredClone(MOCK_EVENTS);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const eventService = {
  async getAll(): Promise<LiveDotEvent[]> {
    await delay(300);
    return structuredClone(eventStore);
  },

  async getById(id: string): Promise<LiveDotEvent> {
    await delay(200);
    const event = eventStore.find((e) => e.id === id);
    if (!event) throw new Error(`Event ${id} not found`);
    return structuredClone(event);
  },

  async transitionState(id: string, targetState: EventState): Promise<LiveDotEvent> {
    await delay(400);
    const idx = eventStore.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error(`Event ${id} not found`);

    const event = eventStore[idx];
    const validTargets = STATE_TRANSITIONS[event.state];
    if (!validTargets.includes(targetState)) {
      throw new Error(`Invalid transition: ${event.state} → ${targetState}`);
    }

    eventStore[idx] = { ...event, state: targetState, updatedAt: new Date().toISOString() };
    return structuredClone(eventStore[idx]);
  },

  async toggleRequirement(id: string, requirementKey: RequirementKey, completed: boolean): Promise<LiveDotEvent> {
    await delay(250);
    const idx = eventStore.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error(`Event ${id} not found`);

    const event = eventStore[idx];
    const updatedRequirements = event.requirements.map((r) =>
      r.key === requirementKey ? { ...r, completed } : r
    );
    const shouldDemote = !completed && event.state === "ready";

    eventStore[idx] = {
      ...event,
      requirements: updatedRequirements,
      state: shouldDemote ? "scheduled" : event.state,
      updatedAt: new Date().toISOString(),
    };
    return structuredClone(eventStore[idx]);
  },

  // ─── Schedule ──────────────────────────────────────────────────────────────
  async scheduleEvent(id: string, scheduledAt: string): Promise<LiveDotEvent> {
    await delay(350);
    const idx = eventStore.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error(`Event ${id} not found`);

    const event = eventStore[idx];
    const newState = event.state === "draft" ? "scheduled" : event.state;

    eventStore[idx] = {
      ...event,
      scheduledAt,
      state: newState,
      updatedAt: new Date().toISOString(),
    };
    return structuredClone(eventStore[idx]);
  },

  // ─── Pricing ───────────────────────────────────────────────────────────────
  async setPricing(id: string, ticketPrice: number | null, isFree: boolean): Promise<LiveDotEvent> {
    await delay(300);
    const idx = eventStore.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error(`Event ${id} not found`);

    const event = eventStore[idx];
    const completed = isFree || (ticketPrice !== null && ticketPrice >= 0);
    const shouldDemote = !completed && event.state === "ready";

    eventStore[idx] = {
      ...event,
      ticketPrice: isFree ? 0 : ticketPrice,
      isFree,
      requirements: event.requirements.map((r) =>
        r.key === "pricing_configured" ? { ...r, completed } : r
      ),
      state: shouldDemote ? "scheduled" : event.state,
      updatedAt: new Date().toISOString(),
    };
    return structuredClone(eventStore[idx]);
  },

  // ─── Stream ingest ─────────────────────────────────────────────────────────
  async setStreamIngest(id: string, config: StreamIngestConfig): Promise<LiveDotEvent> {
    await delay(350);
    const idx = eventStore.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error(`Event ${id} not found`);

    const event = eventStore[idx];
    eventStore[idx] = {
      ...event,
      streamIngest: config,
      requirements: event.requirements.map((r) =>
        r.key === "ingest_configured" ? { ...r, completed: true } : r
      ),
      updatedAt: new Date().toISOString(),
    };
    return structuredClone(eventStore[idx]);
  },

  // ─── Crew ──────────────────────────────────────────────────────────────────
  async setCrew(id: string, crew: CrewMember[]): Promise<LiveDotEvent> {
    await delay(300);
    const idx = eventStore.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error(`Event ${id} not found`);

    const event = eventStore[idx];
    const completed = crew.length > 0;
    const shouldDemote = !completed && event.state === "ready";

    eventStore[idx] = {
      ...event,
      assignedCrew: crew,
      requirements: event.requirements.map((r) =>
        r.key === "crew_assigned" ? { ...r, completed } : r
      ),
      state: shouldDemote ? "scheduled" : event.state,
      updatedAt: new Date().toISOString(),
    };
    return structuredClone(eventStore[idx]);
  },

  // ─── Tech check ────────────────────────────────────────────────────────────
  async updateTechCheckItem(id: string, item: TechCheckItem, checked: boolean): Promise<LiveDotEvent> {
    await delay(200);
    const idx = eventStore.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error(`Event ${id} not found`);

    const event = eventStore[idx];
    eventStore[idx] = {
      ...event,
      techCheck: {
        ...event.techCheck,
        items: { ...event.techCheck.items, [item]: checked },
        signedOffAt: null,
      },
      updatedAt: new Date().toISOString(),
    };
    return structuredClone(eventStore[idx]);
  },

  async signOffTechCheck(id: string): Promise<LiveDotEvent> {
    await delay(400);
    const idx = eventStore.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error(`Event ${id} not found`);

    const event = eventStore[idx];
    const allChecked = Object.values(event.techCheck.items).every(Boolean);
    if (!allChecked) throw new Error("All tech check items must be completed before sign-off.");

    eventStore[idx] = {
      ...event,
      techCheck: { ...event.techCheck, signedOffAt: new Date().toISOString() },
      requirements: event.requirements.map((r) =>
        r.key === "tech_check_done" ? { ...r, completed: true } : r
      ),
      updatedAt: new Date().toISOString(),
    };
    return structuredClone(eventStore[idx]);
  },
};