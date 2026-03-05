"use client";

import { GetPaginatedBookingsResponse } from "@/types/booking.type";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";

async function getBookingById(
    id: number,
    signal: AbortSignal,
): Promise<GetPaginatedBookingsResponse> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/booking/${id}`, {
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

export const getBookingByIdQuery = (id: number) => 
    queryOptions({
        queryKey: ['booking', id],
        queryFn: ({ signal }) => getBookingById(id, signal),
        placeholderData: keepPreviousData
    })