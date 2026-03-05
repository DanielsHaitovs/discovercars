"use client";

import { GetUserResponseDto } from "@/types/user.type";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";

async function getUserByEmail(
    email: string,
    signal: AbortSignal,
): Promise<GetUserResponseDto> {

    const response = await fetch(`http://localhost:3001/user/email/${email}`, {
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

export const getUserByEmailQuery = (email: string) => 
    queryOptions({
        queryKey: ['user', email],
        queryFn: ({ signal }) => getUserByEmail(email, signal),
        placeholderData: keepPreviousData
    })