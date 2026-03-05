"use client";

import { GetUserResponseDto } from "@/types/user.type";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";

async function getUser(
    id: number,
    signal: AbortSignal,
): Promise<GetUserResponseDto> {

    const response = await fetch(`http://localhost:3001/user/${id}`, {
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

export const getUserByIdQuery = (id: number) => 
    queryOptions({
        queryKey: ['user', id],
        queryFn: ({ signal }) => getUser(id, signal),
        placeholderData: keepPreviousData
    })