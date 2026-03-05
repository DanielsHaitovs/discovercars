"use client";

import { GetBookingResponseDto } from "@/types/booking.type";
import { CreateReservationRequest } from "@/types/reservations.type";

export async function createReservation(
    data: CreateReservationRequest,
    signal: AbortSignal,
): Promise<GetBookingResponseDto> {

    const response = await fetch(`http://localhost:3001/reservation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal,
    });

    if (!response.ok) {
        throw new Error(`Failed to create reservation`);
    }

    return await response.json();
}
