import { PaginationRequest, PaginationResponse } from "./pagination.type";
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
  createdAt: string;
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

export type GetPaginatedBookingsResponse = PaginationResponse & {
  data: GetBookingResponseDto[];
}

export type GetPaginatedUserBookingsRequest = PaginationRequest & {
  userId: number | null;
  sortField?: typeof BookingSortFields[number];
}

export type GetPaginatedUserBookingsResponse = PaginationResponse & {
  data: GetBookingResponseDto[];
}