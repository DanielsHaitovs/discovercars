"use client";

import { OfferResponse } from "@/types/reservations.type";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";

async function getOffersByLocationId(
    id: number,
    signal: AbortSignal,
): Promise<OfferResponse[]> {

    const response = await fetch(`http://localhost:3001/reservation/offers/${id}`, {
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

export const getOffersByLocationIdQuery = (id: number) => 
    queryOptions({
        queryKey: ['offers', id],
        queryFn: ({ signal }) => getOffersByLocationId(id, signal),
        placeholderData: keepPreviousData
    })