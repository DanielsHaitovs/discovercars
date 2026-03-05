"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserBookingsQuery } from "@/app/actions/booking/getUserBookings";
import { GetUserResponseDto } from "@/types/user.type";
import {
  X, Loader2, ServerCrash, Inbox,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

interface UserBookingsPanelProps {
  user: GetUserResponseDto;
  onClose: () => void;
}

export function UserBookingsPanel({ user, onClose }: UserBookingsPanelProps) {
  const [page, setPage] = useState(1);
  const [limit] = useState(5);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const { data, isLoading, isFetching, isError } = useQuery(
    getUserBookingsQuery({
      userId: user.id,
      page,
      limit,
      sortOrder: "DESC",
      sortField: "createdAt",
    })
  );

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Bookings for</p>
            <h2 className="font-extrabold text-foreground leading-tight">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-muted transition text-muted-foreground shrink-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className={`h-0.5 bg-primary transition-opacity duration-300 ${isFetching && !isLoading ? "opacity-100" : "opacity-0"}`} />

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-sm">Loading bookings…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
              <ServerCrash size={24} className="text-destructive/60" />
              <span className="text-sm">Failed to load bookings</span>
            </div>
          ) : !data?.data.length ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
              <Inbox size={24} />
              <span className="text-sm">No bookings yet</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data.data.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-primary text-sm">
                      {booking.confirmationNumber}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      #{booking.id}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono">{booking.externalId}</span>
                    {booking.createdAt && (
                      <span>
                        {new Date(booking.createdAt).toLocaleDateString(undefined, {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {data && (
          <div className="border-t border-border px-5 py-3 flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Page <span className="font-semibold text-foreground">{page}</span> of{" "}
              <span className="font-semibold text-foreground">{data.totalPages}</span>
              <span className="ml-2 text-muted-foreground/60">
                ({data.total} total)
              </span>
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}