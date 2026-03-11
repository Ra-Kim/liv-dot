export const queryKeys = {
  events: {
    all: ["events"] as const,
    detail: (id: string) => ["events", id] as const,
  },
};