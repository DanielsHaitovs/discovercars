import { PaginationRequest } from "./pagination.type";
import { GetUserResponseDto } from "./user.type";

export const BookingSortFields = [
  'id',
  'externalId',
  'confirmationNumber',
  'createdAt',
] as const;

export type GetBookingResponseDto = {
    id: number;
    externalId: string;
    confirmationNumber: string;
    user: GetUserResponseDto;
}

export type GetPaginatedBookingsRequest = PaginationRequest & {
  ids: number[] | null;
  externalIds: string[] | null;
  confirmationNumbers: string[] | null;
  userIds: number[] | null;
  emails: string[] | null;
  firstNames: string[] | null;
  lastNames: string[] | null;
  sortField?: typeof BookingSortFields[number];
}

export type GetPaginatedBookingsResponse = PaginationRequest & {
  data: GetBookingResponseDto[];
}
