"use client";

import { useQuery } from "@tanstack/react-query";
import { getLocationsQuery } from "@/app/actions/reservation/getLocations";
import { LocationResponse } from "@/types/reservations.type";
import { MapPin, Search, Loader2 } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

interface SearchFormProps {
  onSearch: (locationId: number) => void;
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const [locationId, setLocationId] = useQueryState(
    "locationId",
    parseAsInteger
  );

  const { data: locations, isLoading } = useQuery(getLocationsQuery());

  const selected = locations?.find((l) => l.id === locationId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (locationId) onSearch(locationId);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MapPin
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <select
            className="w-full appearance-none pl-9 pr-4 py-3 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50 cursor-pointer"
            value={locationId ?? ""}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : null;
              setLocationId(val);
            }}
            disabled={isLoading}
          >
            <option value="">
              {isLoading ? "Loading locations…" : "Pick a pickup location"}
            </option>
            {locations?.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {formatLocation(loc)}
              </option>
            ))}
          </select>
          {isLoading && (
            <Loader2
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin"
              size={14}
            />
          )}
        </div>

        <button
          type="submit"
          disabled={!locationId || isLoading}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <Search size={15} />
          Search cars
        </button>
      </div>

      {selected && (
        <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
          <MapPin size={11} />
          {[selected.name, selected.city, selected.country]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
    </form>
  );
}

export function formatLocation(loc: LocationResponse): string {
  return (
    [loc.name, loc.city, loc.country].filter(Boolean).join(", ") ||
    `Location ${loc.id}`
  );
}
