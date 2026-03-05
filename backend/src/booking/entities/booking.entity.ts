import { IsString } from 'class-validator';
import { type UUID } from 'crypto';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('bookings')
@Index('idx_booking_externalId_confirmationNumber', [
  'externalId',
  'confirmationNumber',
])
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  externalId: string;

  @Column({ length: 255, unique: true })
  @IsString()
  confirmationNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.bookings, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;

  constructor(
    id: number,
    externalId: UUID,
    createdAt: Date,
    updatedAt: Date,
    user: User,
    confirmationNumber: string,
  ) {
    this.id = id;
    this.externalId = externalId;
    this.confirmationNumber = confirmationNumber;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.user = user;
  }
}
