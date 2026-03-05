"use client";

import { GetBookingResponseDto, BookingSortFields } from "@/types/booking.type";
import { ArrowUp, ArrowDown, ArrowUpDown, Loader2, ServerCrash, Inbox } from "lucide-react";

type SortField = typeof BookingSortFields[number];
type SortOrder = "ASC" | "DESC";

interface BookingsTableProps {
  data?: GetBookingResponseDto[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

const COLUMNS: { key: SortField; label: string }[] = [
  { key: "id",                 label: "ID"             },
  { key: "confirmationNumber", label: "Confirmation #" },
  { key: "externalId",         label: "External ID"    },
  { key: "createdAt",          label: "Created"        },
];

export function BookingsTable({
  data, isLoading, isFetching, isError, sortField, sortOrder, onSort,
}: BookingsTableProps) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className={`h-0.5 bg-primary transition-opacity duration-300 ${isFetching && !isLoading ? "opacity-100" : "opacity-0"}`} />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {COLUMNS.map((col) => (
                <th key={col.key} className="text-left px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                  <button
                    onClick={() => onSort(col.key)}
                    className="flex items-center gap-1.5 hover:text-foreground transition group"
                  >
                    {col.label}
                    <SortIcon field={col.key} active={sortField} order={sortOrder} />
                  </button>
                </th>
              ))}
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                User
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                Email
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <TableState cols={6} icon={<Loader2 size={22} className="animate-spin text-muted-foreground" />} label="Loading bookings…" />
            ) : isError ? (
              <TableState cols={6} icon={<ServerCrash size={22} className="text-destructive/60" />} label="Failed to load bookings" />
            ) : !data?.length ? (
              <TableState cols={6} icon={<Inbox size={22} className="text-muted-foreground/50" />} label="No bookings match your filters" />
            ) : (
              data.map((booking) => (
                <tr
                  key={booking.id}
                  className={`border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors ${isFetching ? "opacity-60" : "opacity-100"}`}
                >
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {booking.id}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-primary">
                      {booking.confirmationNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {booking.externalId}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {booking.createdAt
                      ? new Date(booking.createdAt).toLocaleDateString(undefined, {
                          year: "numeric", month: "short", day: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {booking.user ? (
                      <span className="font-medium">
                        {booking.user.firstName} {booking.user.lastName}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {booking.user?.email ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortIcon({ field, active, order }: { field: SortField; active: SortField; order: SortOrder }) {
  if (field !== active) return <ArrowUpDown size={13} className="opacity-30 group-hover:opacity-60 transition" />;
  return order === "ASC"
    ? <ArrowUp size={13} className="text-primary" />
    : <ArrowDown size={13} className="text-primary" />;
}

function TableState({ cols, icon, label }: { cols: number; icon: React.ReactNode; label: string }) {
  return (
    <tr>
      <td colSpan={cols} className="py-16 text-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
      </td>
    </tr>
  );
}
