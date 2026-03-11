"use client";

import { useState } from "react";
import { LiveDotEvent, RequirementKey } from "@/types/event";
import { ScheduleModal }     from "./ScheduleModal";
import { PricingModal }      from "./PricingModal";
import { CrewModal }         from "./CrewModal";
import { StreamIngestModal } from "./StreamingestModal";
import { TechCheckModal } from "./TechcheckModal";

type ModalKey = RequirementKey | "schedule" | null;

interface RequirementModalsProps {
  event: LiveDotEvent;
  /** Controlled from outside — pass which modal to open */
  activeModal: ModalKey;
  onClose: () => void;
}

export function RequirementModals({ event, activeModal, onClose }: RequirementModalsProps) {
  return (
    <>
      <ScheduleModal
        event={event}
        open={activeModal === "schedule"}
        onClose={onClose}
      />
      <PricingModal
        event={event}
        open={activeModal === "pricing_configured"}
        onClose={onClose}
      />
      <StreamIngestModal
        event={event}
        open={activeModal === "ingest_configured"}
        onClose={onClose}
      />
      <CrewModal
        event={event}
        open={activeModal === "crew_assigned"}
        onClose={onClose}
      />
      <TechCheckModal
        event={event}
        open={activeModal === "tech_check_done"}
        onClose={onClose}
      />
    </>
  );
}

/** Hook to manage which modal is open — use this in the detail page */
export function useRequirementModal() {
  const [activeModal, setActiveModal] = useState<ModalKey>(null);
  return {
    activeModal,
    openModal: (key: ModalKey) => setActiveModal(key),
    closeModal: () => setActiveModal(null),
  };
}