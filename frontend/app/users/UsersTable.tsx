"use client";

import { GetUserResponseDto, UserSortField } from "@/types/user.type";
import { ArrowUp, ArrowDown, ArrowUpDown, Loader2, ServerCrash, Inbox, ChevronRight } from "lucide-react";

type SortField = typeof UserSortField[number];
type SortOrder = "ASC" | "DESC";

interface UsersTableProps {
  data?: GetUserResponseDto[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  selectedUserId?: number;
  onUserClick: (user: GetUserResponseDto) => void;
}

const COLUMNS: { key: SortField; label: string; sortable: boolean }[] = [
  { key: "id",        label: "ID",         sortable: true },
  { key: "firstName", label: "First name", sortable: true },
  { key: "lastName",  label: "Last name",  sortable: true },
  { key: "email",     label: "Email",      sortable: true },
  { key: "createdAt", label: "Created",    sortable: true },
];

export function UsersTable({
  data, isLoading, isFetching, isError, sortField, sortOrder, onSort, selectedUserId, onUserClick,
}: UsersTableProps) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className={`h-0.5 bg-primary transition-opacity duration-300 ${isFetching && !isLoading ? "opacity-100" : "opacity-0"}`} />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {COLUMNS.map((col) => (
                <th key={col.key} className="text-left px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                  {col.sortable ? (
                    <button
                      onClick={() => onSort(col.key)}
                      className="flex items-center gap-1.5 hover:text-foreground transition group"
                    >
                      {col.label}
                      <SortIcon field={col.key} active={sortField} order={sortOrder} />
                    </button>
                  ) : col.label}
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <TableState icon={<Loader2 size={22} className="animate-spin text-muted-foreground" />} label="Loading users…" />
            ) : isError ? (
              <TableState icon={<ServerCrash size={22} className="text-destructive/60" />} label="Failed to load users" />
            ) : !data?.length ? (
              <TableState icon={<Inbox size={22} className="text-muted-foreground/50" />} label="No users match your filters" />
            ) : (
              data.map((user) => {
                const isSelected = user.id === selectedUserId;
                return (
                  <tr
                    key={user.id}
                    onClick={() => onUserClick(user)}
                    className={`border-b border-border/50 last:border-0 cursor-pointer transition-colors
                      ${isSelected
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-muted/30"
                      }
                      ${isFetching ? "opacity-60" : "opacity-100"}`}
                  >
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{user.id}</td>
                    <td className="px-4 py-3 font-medium">{user.firstName}</td>
                    <td className="px-4 py-3 font-medium">{user.lastName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight
                        size={14}
                        className={`transition-colors ${isSelected ? "text-primary" : "text-muted-foreground/40"}`}
                      />
                    </td>
                  </tr>
                );
              })
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

function TableState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <tr>
      <td colSpan={6} className="py-16 text-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
      </td>
    </tr>
  );
}