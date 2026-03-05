"use client";

import { useDebounce } from "@/hooks/debounce.hook";
import { appendArrayParams } from "@/lib/params.lib";
import { QUERY_LIMITS, QUERY_SORT_ORDERS } from "@/lib/query.lib";
import { GetPagiantedUserRequest, GetPaginatedUserResponse, UserSortField } from "@/types/user.type";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { parseAsArrayOf, parseAsInteger, parseAsNumberLiteral, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

export function useGetUsersQuery(): GetPagiantedUserRequest {
    return useDebounce(
        useQueryStates({
            limit: parseAsNumberLiteral(QUERY_LIMITS).withDefault(5),
            page: parseAsInteger.withDefault(1),
            sortOrder: parseAsStringLiteral(QUERY_SORT_ORDERS).withDefault('ASC'),
            sortField: parseAsStringLiteral(UserSortField).withDefault('createdAt'),
            ids: parseAsArrayOf(parseAsInteger),
            emails: parseAsArrayOf(parseAsString),
            firstNames: parseAsArrayOf(parseAsString),
            lastNames: parseAsArrayOf(parseAsString),
        })[0],
        500
    )
}

async function getUsers(
    data: GetPagiantedUserRequest,
    signal: AbortSignal,
): Promise<GetPaginatedUserResponse> {
    const { page, limit, sortField, sortOrder, ...filters } = data;

    const params = new URLSearchParams()

    for (const key of Object.keys(filters) as (keyof typeof filters)[]) {
        appendArrayParams(
            params,
            key,
            data[key] as Array<(keyof GetPagiantedUserRequest)[number]>
        );
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/user/query?page=${page}&limit=${limit}&sortOrder=${sortOrder}&sortField=${sortField}&${params.toString()}`, {
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

export const getUsersQuery = (query: GetPagiantedUserRequest) => 
    queryOptions({
        queryKey: ['users', query],
        queryFn: ({ signal }) => getUsers(query, signal),
        placeholderData: keepPreviousData
    })