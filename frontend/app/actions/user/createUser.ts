"use client";

import { CreateUserDto, GetPaginatedUserResponse } from "@/types/user.type";

export async function createUser(
    data: CreateUserDto,
    signal: AbortSignal,
): Promise<GetPaginatedUserResponse> {

    const response = await fetch(`http://localhost:3001/user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal,
    });

    if (!response.ok) {
        throw new Error(`Failed to create user`);
    }

    return await response.json();
}
