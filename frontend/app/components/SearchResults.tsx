"use client";

import { useQuery } from "@tanstack/react-query";
import { getOffersByLocationIdQuery } from "@/app/actions/reservation/getOffersByLocationId";
import { OfferResponse } from "@/types/reservations.type";
import { OfferCard } from "./OfferCard";
import { OfferDetail } from "./OfferDetail";
import { useState } from "react";
import { Loader2, ServerCrash, SearchX } from "lucide-react";

interface SearchResultsProps {
  locationId: number;
}

export function SearchResults({ locationId }: SearchResultsProps) {
  const [selected, setSelected] = useState<OfferResponse | null>(null);

  const { data: rawOffers, isLoading, isError, error } = useQuery(
    getOffersByLocationIdQuery(locationId)
  );

  const offers = rawOffers
    ? [...rawOffers].sort(
        (a, b) =>
          a.price.amount - b.price.amount ||
          (a.offerUId ?? "").localeCompare(b.offerUId ?? "")
      )
    : rawOffers;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <Loader2 size={32} className="animate-spin" />
        <p className="text-sm font-medium">Searching for available cars…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <ServerCrash size={32} className="text-destructive/60" />
        <p className="text-sm font-medium">Failed to load offers</p>
        <p className="text-xs text-muted-foreground/70">
          {(error as { message?: string })?.message ?? "Please try again."}
        </p>
      </div>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <SearchX size={32} />
        <p className="text-sm font-medium">No cars available at this location</p>
        <p className="text-xs">Try a different pickup point</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{offers.length}</span>{" "}
          {offers.length === 1 ? "car" : "cars"} available
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer) => (
          <OfferCard
            key={offer.offerUId}
            offer={offer}
            onClick={() => setSelected(offer)}
          />
        ))}
      </div>

      {selected && (
        <OfferDetail offer={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}