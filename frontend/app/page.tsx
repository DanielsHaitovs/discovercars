"use client";

import Image from "next/image";
import { getUsersQuery, useGetUsersQuery } from "./actions/user/getUsers";
import { useQuery } from "@tanstack/react-query";
import { getUserByIdQuery } from "./actions/user/getUser";
import { getBookingsQuery, useGetBookingsQuery } from "./actions/booking/getBookings";
import { getBookingByIdQuery } from "./actions/booking/getBookingById";
import { getLocationsQuery } from "./actions/reservation/getLocations";
import { getOffersByLocationIdQuery } from "./actions/reservation/getOffersByLocationId";
import { getUserBookingsQuery, useGetUserBookingsQuery } from "./actions/booking/getUserBookings";

export default function Home() {
  const usersQuery = useGetUsersQuery();

  const { data: users, isLoading, isError, error, isFetching } = useQuery(getUsersQuery(usersQuery));

  const { data: user, isLoading: isUserLoading, isError: isUserError, error: userError, isFetching: isUserFetching } = useQuery(getUserByIdQuery(1));

  // const createUser = await createUser({
  //   email: 'test@example.com',
  //   firstName: 'Test',
  //   lastName: 'User'
  // })

  // const createReservation = await createReservation({
  //   userId: 1,
  //   offerUId: 'asdfas',
  // })

  const bookingsQuery = useGetBookingsQuery();

  const { data: bookings, isLoading: isBookingsLoading, isError: isBookingsError, error: bookingsError, isFetching: isBookingsFetching } = useQuery(getBookingsQuery(bookingsQuery));
  const { data: booking, isLoading: isBookingLoading, isError: isBookingError, error: bookingError, isFetching: isBookingFetching } = useQuery(getBookingByIdQuery(4));

  const { data: locations, isLoading: isLocationsLoading, isError: isLocationsError, error: locationsError, isFetching: isLocationsFetching } = useQuery(getLocationsQuery());

  const { data: offers, isLoading: isOffersLoading, isError: isOffersError, error: offersError, isFetching: isOffersFetching } = useQuery(getOffersByLocationIdQuery(1));

  const userBookingsQuery = useGetUserBookingsQuery();

  const { data: userBookings, isLoading: isUserBookingsLoading, isError: isUserBookingsError, error: userBookingsError, isFetching: isUserBookingsFetching } = useQuery(getUserBookingsQuery({ ...userBookingsQuery, userId: 4 }));
  console.log(users);
  console.log(user);
  console.log(bookings);
  console.log(booking);
  console.log(locations);
  console.log(offers);
  console.log(userBookings);
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100} 
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start text-6xl sm:text-left">
        </div>
      </main>
    </div>
  );
}
