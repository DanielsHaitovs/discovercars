import { QueryFailedError } from 'typeorm';

export class TypeOrmError extends QueryFailedError<{ code: string } & Error> {}
