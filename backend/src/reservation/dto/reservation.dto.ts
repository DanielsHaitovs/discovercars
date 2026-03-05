import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CustomerDto {
  @ApiPropertyOptional({ description: 'Customer name', example: 'John' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Customer surname', example: 'Doe' })
  @IsString()
  @IsOptional()
  surname?: string;
}

export class LocationDto {
  @ApiProperty({ description: 'Location ID', example: 101 })
  @IsInt()
  @IsNotEmpty()
  id: number;

  @ApiPropertyOptional({ description: 'Country name', example: 'Latvia' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'City name', example: 'Riga' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'Location name',
    example: 'Riga Airport',
  })
  @IsString()
  @IsOptional()
  name?: string;

  constructor(id: number, country?: string, city?: string, name?: string) {
    this.id = id;
    this.country = country;
    this.city = city;
    this.name = name;
  }
}

export class VehicleDto {
  @ApiPropertyOptional({ description: 'Model name', example: 'Toyota Corolla' })
  @IsString()
  @IsOptional()
  modelName?: string;

  @ApiPropertyOptional({
    description:
      'SIPP code. Please see more in https://www.acriss.org/car-codes/',
    example: 'CDMR',
  })
  @IsString()
  @IsOptional()
  sipp?: string;

  @ApiPropertyOptional({
    description: 'Image link',
    example: 'https://example.com/car.png',
  })
  @IsString()
  @IsOptional()
  imageLink?: string;
}

export class VendorDto {
  @ApiPropertyOptional({ description: 'Vendor name', example: 'Discover Cars' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Image link',
    example: 'https://example.com/logo.svg',
  })
  @IsString()
  @IsOptional()
  imageLink?: string;
}

export class PriceDto {
  @ApiProperty({ description: 'Price amount', example: 49.99 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({ description: 'Currency', example: 'EUR' })
  @IsString()
  @IsOptional()
  currency?: string;

  constructor(amount: number, currency?: string) {
    this.amount = amount;
    this.currency = currency;
  }
}

export class OfferDto {
  @ApiPropertyOptional({ description: 'Unique offer ID', example: 'OFF-123' })
  @IsString()
  @IsOptional()
  offerUId?: string;

  @ApiProperty({ description: 'Vehicle details', type: () => VehicleDto })
  @ValidateNested()
  @Type(() => VehicleDto)
  vehicle: VehicleDto;

  @ApiProperty({ description: 'Price details', type: () => PriceDto })
  @ValidateNested()
  @Type(() => PriceDto)
  price: PriceDto;

  @ApiProperty({ description: 'Vendor details', type: () => VendorDto })
  @ValidateNested()
  @Type(() => VendorDto)
  vendor: VendorDto;

  constructor(vehicle: VehicleDto, price: PriceDto, vendor: VendorDto) {
    this.vehicle = vehicle;
    this.price = price;
    this.vendor = vendor;
  }
}

export class ReservationDto {
  @ApiPropertyOptional({
    description: 'Reservation confirmation number',
    example: 'CONF-987654',
  })
  @IsString()
  @IsOptional()
  confirmationNumber?: string;
}

export class ReservationRequestDto {
  @ApiPropertyOptional({ description: 'Offer unique ID', example: 'OFF-123' })
  @IsString()
  @IsOptional()
  offerUId?: string;

  @ApiProperty({ description: 'Customer details', type: () => CustomerDto })
  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  constructor(customer: CustomerDto, offerUId?: string) {
    this.customer = customer;
    this.offerUId = offerUId;
  }
}

export class CreateReservationDto {
  @ApiProperty({
    description: 'The ID of the user making the reservation',
    example: 1,
    type: Number,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  externalId: string;

  constructor(userId: number, externalId: string) {
    this.userId = userId;
    this.externalId = externalId;
  }
}
