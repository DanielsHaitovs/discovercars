export type PaginationRequest = {
    page: number;
    limit: number;
    sortOrder: 'ASC' | 'DESC';
}

export type PaginationResponse = {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
}