"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useSetPricing } from "@/hooks/useEventQueries";
import { LiveDotEvent } from "@/types/event";
import { TicketIcon } from "lucide-react";

interface PricingModalProps {
  event: LiveDotEvent;
  open: boolean;
  onClose: () => void;
}

export function PricingModal({ event, open, onClose }: PricingModalProps) {
  const { mutate, isPending } = useSetPricing(event.id);

  const [isFree, setIsFree] = useState(event.isFree);
  const [price, setPrice] = useState(
    event.ticketPrice !== null && !event.isFree ? String(event.ticketPrice) : ""
  );
  const [error, setError] = useState("");

  function handleSave() {
    if (!isFree) {
      const parsed = parseFloat(price);
      if (isNaN(parsed) || parsed < 0.5) {
        setError("Enter a valid price (minimum $0.50).");
        return;
      }
    }
    setError("");
    mutate(
      { ticketPrice: isFree ? 0 : parseFloat(price), isFree },
      { onSuccess: onClose }
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ticket Pricing"
      description="Set how much attendees pay to access this event."
      size="sm"
    >
      <div className="space-y-4">
        {/* Free toggle */}
        <div
          onClick={() => { setIsFree(!isFree); setError(""); }}
          className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
            isFree
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-white/8 bg-zinc-800/50 hover:border-white/[0.14]"
          }`}
        >
          <div>
            <p className="text-sm font-medium text-white">Free event</p>
            <p className="text-xs text-zinc-500">Anyone can join at no cost</p>
          </div>
          <div className={`h-5 w-9 rounded-full transition-colors ${isFree ? "bg-emerald-500" : "bg-zinc-700"}`}>
            <div className={`mt-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isFree ? "translate-x-4.5 ml-0.5" : "ml-0.5"}`} />
          </div>
        </div>

        {/* Price input */}
        {!isFree && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Ticket Price (USD)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">$</span>
              <input
                type="number"
                min="0.50"
                step="0.50"
                value={price}
                onChange={(e) => { setPrice(e.target.value); setError(""); }}
                placeholder="0.00"
                className="w-full rounded-lg border border-white/8 bg-zinc-800 py-2.5 pl-7 pr-3 text-sm text-white placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
          </div>
        )}

        {/* Preview */}
        <div className="flex items-center gap-2 rounded-lg border border-white/6 bg-zinc-800/50 px-3 py-2.5">
          <TicketIcon className="h-4 w-4 shrink-0 text-zinc-500" />
          <p className="text-sm text-zinc-300">
            {isFree
              ? "Free — open to everyone"
              : price
              ? `$${parseFloat(price).toFixed(2)} per ticket`
              : "Enter a price above"}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || (!isFree && !price)}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isPending ? "Saving…" : "Save Pricing"}
          </button>
        </div>
      </div>
    </Modal>
  );
}