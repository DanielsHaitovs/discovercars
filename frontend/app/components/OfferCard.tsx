"use client";

import Image from "next/image";
import { OfferResponse } from "@/types/reservations.type";
import { Car, ChevronRight } from "lucide-react";

interface OfferCardProps {
  offer: OfferResponse;
  onClick: () => void;
}

export function OfferCard({ offer, onClick }: OfferCardProps) {
  const { vehicle, vendor, price } = offer;

  return (
    <button
      onClick={onClick}
      className="group text-left w-full rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <div className="relative w-full h-44 bg-muted flex items-center justify-center overflow-hidden">
        {vehicle.imageLink ? (
          <Image
            src={vehicle.imageLink}
            alt={vehicle.modelName ?? "Car"}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : null}
        <Car
          size={48}
          className="text-muted-foreground/30 absolute"
          aria-hidden="true"
        />
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
            {vehicle.sipp ?? "—"}
          </p>
          <h3 className="font-bold text-base text-foreground leading-tight">
            {vehicle.modelName ?? "Unknown model"}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {vendor.imageLink ? (
            <div className="relative w-8 h-8 rounded-lg border border-border overflow-hidden shrink-0 bg-background">
              <Image
                src={vendor.imageLink}
                alt={vendor.name ?? "Supplier"}
                fill
                className="object-contain p-1"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg border border-border bg-muted flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-muted-foreground">
                {vendor.name?.[0] ?? "?"}
              </span>
            </div>
          )}
          <span className="text-sm text-muted-foreground font-medium truncate">
            {vendor.name ?? "Unknown supplier"}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          <div>
            <span className="text-xl font-extrabold text-foreground">
              {price.currency}{" "}
              {price.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs text-muted-foreground ml-1">/ rental</span>
          </div>
          <span className="text-xs font-semibold text-primary flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
            View details
            <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </button>
  );
}