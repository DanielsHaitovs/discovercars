import { IsEmail, IsString } from 'class-validator';
import { Booking } from 'src/booking/entities/booking.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user')
@Index('idx_user_email_first_last', ['email', 'firstName', 'lastName'])
@Index('idx_user_created_at', ['createdAt'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  @IsEmail()
  email: string;

  @Column({ length: 255, nullable: false })
  @IsString()
  firstName: string;

  @Column({ length: 255, nullable: false })
  @IsString()
  lastName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  constructor(
    id: number,
    email: string,
    firstName: string,
    lastName: string,
    createdAt: Date,
    updatedAt: Date,
    bookings: Booking[],
  ) {
    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.bookings = bookings;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
