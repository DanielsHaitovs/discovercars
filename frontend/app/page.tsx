"use client";

import { parseAsInteger, useQueryState } from "nuqs";
import { SearchForm } from "./components/SearchForm";
import { SearchResults } from "./components/SearchResults";
import { Car } from "lucide-react";
import { Suspense } from "react";

// Wrap everything that reads from useQueryState in its own component
// so Next.js can suspend it during SSR and avoid the server/client mismatch.
function CarSearch() {
  const [locationId, setLocationId] = useQueryState(
    "locationId",
    parseAsInteger
  );

  return (
    <>
      <div className="max-w-xl">
        <SearchForm onSearch={(id) => setLocationId(id)} />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {locationId ? (
          <SearchResults locationId={locationId} />
        ) : (
          <EmptyState />
        )}
      </div>
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero / search header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Car size={18} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              CarRental
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Find your perfect ride
          </h1>
          <p className="text-muted-foreground text-base mb-7">
            Search from hundreds of cars across multiple locations
          </p>

          {/* Suspense boundary prevents SSR from rendering URL-dependent state */}
          <Suspense>
            <CarSearch />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
        <Car size={28} className="text-muted-foreground" />
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">
          Pick a location to get started
        </p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Select a pickup location above and hit <strong>Search cars</strong> to
          browse available rentals.
        </p>
      </div>
    </div>
  );
}