"use client";

import { useDebounce } from "@/hooks/debounce.hook";
import { QUERY_LIMITS, QUERY_SORT_ORDERS } from "@/lib/query.lib";
import { BookingSortFields, GetPaginatedUserBookingsRequest, GetPaginatedUserBookingsResponse } from "@/types/booking.type";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { parseAsInteger, parseAsNumberLiteral, parseAsStringLiteral, useQueryStates } from "nuqs";

export function useGetUserBookingsQuery(): GetPaginatedUserBookingsRequest {
    return useDebounce(
        useQueryStates({
            limit: parseAsNumberLiteral(QUERY_LIMITS).withDefault(5),
            page: parseAsInteger.withDefault(1),
            sortOrder: parseAsStringLiteral(QUERY_SORT_ORDERS).withDefault('ASC'),
            sortField: parseAsStringLiteral(BookingSortFields).withDefault('createdAt'),
            userId: parseAsInteger,
        })[0],
        500
    )
}

async function getUserBookings(
    data: GetPaginatedUserBookingsRequest,
    signal: AbortSignal,
): Promise<GetPaginatedUserBookingsResponse> {
    const { page, limit, sortField, sortOrder, userId } = data;


    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/booking/user/${userId}?page=${page}&limit=${limit}&sortOrder=${sortOrder}&sortField=${sortField}`, {
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

export const getUserBookingsQuery = (query: GetPaginatedUserBookingsRequest) => 
    queryOptions({
        queryKey: ['user-bookings', query],
        queryFn: ({ signal }) => getUserBookings(query, signal),
        placeholderData: keepPreviousData
    })