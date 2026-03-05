"use client";

import { useQuery } from "@tanstack/react-query";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsNumberLiteral,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useDebounce } from "@/hooks/debounce.hook";
import { getUsersQuery } from "@/app/actions/user/getUsers";
import { QUERY_LIMITS, QUERY_SORT_ORDERS } from "@/lib/query.lib";
import { UserSortField } from "@/types/user.type";
import { UsersFilters } from "./UsersFilters";
import { UsersTable } from "./UsersTable";
import { Pagination } from "../components/Pagination";
import { Users, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { GetUserResponseDto } from "@/types/user.type";
import { UserBookingsPanel } from "./UsersBookingPanel";

export function UsersView() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<GetUserResponseDto | null>(null);

  const [query, setQuery] = useQueryStates({
    limit: parseAsNumberLiteral(QUERY_LIMITS).withDefault(10),
    page: parseAsInteger.withDefault(1),
    sortOrder: parseAsStringLiteral(QUERY_SORT_ORDERS).withDefault("ASC"),
    sortField: parseAsStringLiteral(UserSortField).withDefault("createdAt"),
    ids: parseAsArrayOf(parseAsInteger),
    emails: parseAsArrayOf(parseAsString),
    firstNames: parseAsArrayOf(parseAsString),
    lastNames: parseAsArrayOf(parseAsString),
  });

  const debouncedFilters = useDebounce(
    { ids: query.ids, emails: query.emails, firstNames: query.firstNames, lastNames: query.lastNames },
    500
  );

  const { data, isLoading, isFetching, isError } = useQuery(
    getUsersQuery({
      page: query.page,
      limit: query.limit,
      sortOrder: query.sortOrder,
      sortField: query.sortField,
      ...debouncedFilters,
    })
  );

  const activeFilterCount = [
    query.ids?.length,
    query.emails?.length,
    query.firstNames?.length,
    query.lastNames?.length,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Users size={18} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight leading-none">Users</h1>
              {data && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {data.total.toLocaleString()} total
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition
                ${filtersOpen || activeFilterCount > 0
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:border-primary/40"
                }`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-primary-foreground text-primary text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6 items-start">
        <div
          className={`shrink-0 transition-all duration-300 overflow-hidden ${
            filtersOpen ? "w-72 opacity-100" : "w-0 opacity-0"
          }`}
        >
          <div className="w-72">
            <UsersFilters
              query={query}
              onChange={(patch) =>
                setQuery((prev) => ({ ...prev, ...patch, page: 1 }))
              }
              onReset={() =>
                setQuery({
                  ids: null,
                  emails: null,
                  firstNames: null,
                  lastNames: null,
                  page: 1,
                  limit: 10,
                  sortOrder: "ASC",
                  sortField: "createdAt",
                })
              }
            />
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <UsersTable
            data={data?.data}
            isLoading={isLoading}
            isFetching={isFetching}
            isError={isError}
            sortField={query.sortField ?? "createdAt"}
            sortOrder={query.sortOrder}
            onSort={(field) =>
              setQuery((prev) => ({
                ...prev,
                sortField: field,
                sortOrder:
                  prev.sortField === field && prev.sortOrder === "ASC" ? "DESC" : "ASC",
                page: 1,
              }))
            }
            selectedUserId={selectedUser?.id}
            onUserClick={(user) =>
              setSelectedUser((prev) => prev?.id === user.id ? null : user)
            }
          />

          {data && (
            <Pagination
              page={query.page}
              limit={query.limit}
              total={data.total}
              totalPages={data.totalPages}
              onPage={(p) => setQuery((prev) => ({ ...prev, page: p }))}
              onLimit={(l) => setQuery((prev) => ({ ...prev, limit: l, page: 1 }))}
              label="users"
            />
          )}
        </div>
      </div>

      {selectedUser && (
        <UserBookingsPanel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}