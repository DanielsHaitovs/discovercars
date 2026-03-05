import { PaginationRequest, PaginationResponse } from "./pagination.type";

export type CreateUserDto = {
  email: string;
  firstName: string;
  lastName: string;
};

export type GetUserResponseDto = CreateUserDto & {
  id: number;
  createdAt: string;
};

export const UserSortField = [
  'id',
  'email',
  'firstName',
  'lastName',
  'createdAt',
 ] as const;

export type GetPagiantedUserRequest = PaginationRequest & {
  ids: number[] | null;
  emails: string[] | null;
  firstNames: string[] | null;
  lastNames: string[] | null;
  sortField?: typeof UserSortField[number];
}

export type GetPaginatedUserResponse = PaginationResponse & {
  data: GetUserResponseDto[];
}
