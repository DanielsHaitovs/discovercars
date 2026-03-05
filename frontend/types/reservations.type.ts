export type LocationResponse = {
  id: number;
  country?: string;
  city?: string;
  name?: string;
}

export type VehicleResponse = {
  modelName?: string;
  sipp?: string;
  imageLink?: string;
}

export type VendorResponse = {
  name?: string;
  imageLink?: string;
}

export type PriceResponse = {
  amount: number;
  currency: string;
}

export type OfferResponse = {
  offerUId?: string;
  vehicle: VehicleResponse;
  price: PriceResponse;
  vendor: VendorResponse;
}

export type CreateReservationRequest = {
  offerUId: string;
  userId: number;
}