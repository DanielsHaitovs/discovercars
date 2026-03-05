import { IsString } from 'class-validator';
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

  @Column()
  @IsString()
  externalId: string;

  // Would be better to have a unique constraint on this field, but the external API doesn't guarantee uniqueness.
  @Column({ length: 255 })
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
    externalId: string,
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
