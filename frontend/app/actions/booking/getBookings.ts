"use client";

import { useDebounce } from "@/hooks/debounce.hook";
import { appendArrayParams } from "@/lib/params.lib";
import { QUERY_LIMITS, QUERY_SORT_ORDERS } from "@/lib/query.lib";
import { BookingSortFields, GetPaginatedBookingsRequest, GetPaginatedBookingsResponse } from "@/types/booking.type";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { parseAsArrayOf, parseAsInteger, parseAsNumberLiteral, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

export function useGetBookingsQuery(): GetPaginatedBookingsRequest {
    return useDebounce(
        useQueryStates({
            limit: parseAsNumberLiteral(QUERY_LIMITS).withDefault(5),
            page: parseAsInteger.withDefault(1),
            sortOrder: parseAsStringLiteral(QUERY_SORT_ORDERS).withDefault('ASC'),
            sortField: parseAsStringLiteral(BookingSortFields).withDefault('createdAt'),
            ids: parseAsArrayOf(parseAsInteger),
            externalIds: parseAsArrayOf(parseAsString),
            confirmationNumbers: parseAsArrayOf(parseAsString),
            userIds: parseAsArrayOf(parseAsInteger),
            emails: parseAsArrayOf(parseAsString),
            firstNames: parseAsArrayOf(parseAsString),
            lastNames: parseAsArrayOf(parseAsString),
        })[0],
        500
    )
}

async function getBookings(
    data: GetPaginatedBookingsRequest,
    signal: AbortSignal,
): Promise<GetPaginatedBookingsResponse> {
    const { page, limit, sortField, sortOrder, ...filters } = data;

    const params = new URLSearchParams()

    for (const key of Object.keys(filters) as (keyof typeof filters)[]) {
        appendArrayParams(
            params,
            key,
            data[key] as Array<(keyof GetPaginatedBookingsRequest)[number]>
        );
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/booking/query?page=${page}&limit=${limit}&sortOrder=${sortOrder}&sortField=${sortField}&${params.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        signal,
    });

    if (!response.ok) {
        throw await response.json();
    }

    return await response.json();
}

export const getBookingsQuery = (query: GetPaginatedBookingsRequest) => 
    queryOptions({
        queryKey: ['bookings', query],
        queryFn: ({ signal }) => getBookings(query, signal),
        placeholderData: keepPreviousData
    })