"use client";

import Image from "next/image";
import { OfferResponse } from "@/types/reservations.type";
import {
  Car, X, Tag, Building2, CheckCircle2, ArrowLeft,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createReservation } from "@/app/actions/reservation/createReservation";
import { createUser } from "@/app/actions/user/createUser";
import { GetBookingResponseDto } from "@/types/booking.type";
import { UserForm, UserFormValues } from "./UserForm";

interface OfferDetailProps {
  offer: OfferResponse;
  onClose: () => void;
}

type Step = "detail" | "user-form";

type BookingState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; booking: GetBookingResponseDto; user: UserFormValues }
  | { status: "error"; message: string };

export function OfferDetail({ offer, onClose }: OfferDetailProps) {
  const [step, setStep] = useState<Step>("detail");
  const [booking, setBooking] = useState<BookingState>({ status: "idle" });
  const abortRef = useRef<AbortController | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { vehicle, vendor, price } = offer;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (step === "user-form" && booking.status !== "loading") {
          setStep("detail");
        } else if (booking.status !== "loading") {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, step, booking.status]);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  async function handleUserSubmit(values: UserFormValues, existingUserId?: number) {
    if (!offer.offerUId) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setBooking({ status: "loading" });

    try {
      let userId: number;

      if (existingUserId !== undefined) {
        userId = existingUserId;
      } else {
        const user = await createUser(values, abortRef.current.signal);
        userId = (user as unknown as { id: number }).id;
      }

      const result = await createReservation(
        { offerUId: offer.offerUId, userId },
        abortRef.current.signal
      );

      setBooking({ status: "success", booking: result, user: values });
    } catch (err: unknown) {
      if ((err as { name?: string }).name === "AbortError") return;
      setBooking({
        status: "error",
        message: (err as { message?: string }).message ?? "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Offer details: ${vehicle.modelName}`}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => { if (booking.status !== "loading") onClose(); }}
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative z-10 w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-2xl shadow-2xl outline-none max-h-[90svh] flex flex-col overflow-hidden"
      >
        <button
          onClick={() => { if (booking.status !== "loading") onClose(); }}
          className="absolute top-4 right-4 z-20 rounded-full p-1.5 hover:bg-muted transition text-muted-foreground"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div
          className="flex flex-1 min-h-0 transition-transform duration-300 ease-in-out"
          style={{
            width: "200%",
            transform: step === "user-form" ? "translateX(-50%)" : "translateX(0)",
          }}
        >
          <div className="flex flex-col min-h-0" style={{ width: "50%" }}>
            <div className="overflow-y-auto flex-1">
              <div className="relative w-full h-52 bg-muted flex items-center justify-center overflow-hidden">
                {vehicle.imageLink && (
                  <Image src={vehicle.imageLink} alt={vehicle.modelName ?? "Car"} fill className="object-contain p-6" />
                )}
                <Car size={64} className="text-muted-foreground/20 absolute" aria-hidden="true" />
              </div>

              <div className="p-6 flex flex-col gap-5">
                <div>
                  {vehicle.sipp && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full mb-2">
                      <Tag size={10} />{vehicle.sipp}
                    </span>
                  )}
                  <h2 className="text-2xl font-extrabold text-foreground leading-tight">
                    {vehicle.modelName ?? "Unknown model"}
                  </h2>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <Building2 size={14} className="text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-muted-foreground">Supplied by</span>
                  {vendor.imageLink ? (
                    <div className="relative w-10 h-10 rounded-lg border border-border overflow-hidden bg-background shrink-0 ml-auto">
                      <Image src={vendor.imageLink} alt={vendor.name ?? "Supplier"} fill className="object-contain p-1" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg border border-border bg-background flex items-center justify-center shrink-0 ml-auto">
                      <span className="text-sm font-bold">{vendor.name?.[0] ?? "?"}</span>
                    </div>
                  )}
                  <span className="text-sm font-semibold">{vendor.name ?? "Unknown supplier"}</span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {price.currency}{" "}
                    {price.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-sm text-muted-foreground">per rental</span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-2 border-t border-border bg-background">
              <button
                onClick={() => setStep("user-form")}
                disabled={!offer.offerUId}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm tracking-wide transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 size={16} />
                Book this car
              </button>
            </div>
          </div>

          <div className="flex flex-col min-h-0" style={{ width: "50%" }}>
            <div className="overflow-y-auto flex-1">
              <div className="p-6 flex flex-col gap-5">
                <div className="flex items-center gap-3 pr-8">
                  <button
                    onClick={() => {
                      if (booking.status !== "loading") {
                        setStep("detail");
                        setBooking({ status: "idle" });
                      }
                    }}
                    className="rounded-full p-1.5 hover:bg-muted transition text-muted-foreground shrink-0"
                    aria-label="Back to offer"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Booking</p>
                    <h3 className="font-extrabold text-foreground leading-tight truncate">
                      {vehicle.modelName ?? "Car"}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm">
                  <span className="text-muted-foreground font-medium">Total</span>
                  <span className="font-extrabold text-foreground">
                    {price.currency}{" "}
                    {price.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Your details</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    We need a few details to complete your booking.
                  </p>

                  {booking.status === "success" ? (
                    <ConfirmationBanner booking={booking.booking} user={booking.user} />
                  ) : (
                    <UserForm
                      onSubmit={(values, existingUserId) => handleUserSubmit(values, existingUserId)}
                      submitLabel="Confirm booking"
                      isLoading={booking.status === "loading"}
                      error={booking.status === "error" ? booking.message : null}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmationBanner({ booking, user }: { booking: GetBookingResponseDto; user: UserFormValues }) {
  return (
    <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 size={20} className="shrink-0" />
        <span className="font-bold text-base">Booking confirmed!</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ConfirmField label="Confirmation #" value={booking.confirmationNumber} highlight />
        <ConfirmField label="Booking ID" value={String(booking.id)} />
        <ConfirmField label="Name" value={`${user.firstName} ${user.lastName}`} />
        <ConfirmField label="Email" value={user.email} />
      </div>
    </div>
  );
}

function ConfirmField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-bold break-all ${highlight ? "text-emerald-700 dark:text-emerald-400 text-base" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}