"use client";

import { LocationResponse } from "@/types/reservations.type";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";

async function getLocations(
    signal: AbortSignal,
): Promise<LocationResponse[]> {

    const response = await fetch(`http://localhost:3001/reservation/locations`, {
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

export const getLocationsQuery = () => 
    queryOptions({
        queryKey: ['locations'],
        queryFn: ({ signal }) => getLocations(signal),
        placeholderData: keepPreviousData
    })