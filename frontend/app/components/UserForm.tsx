"use client";

import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreateUserDto, GetUserResponseDto } from "@/types/user.type";
import { getUserByEmailQuery } from "@/app/actions/user/getUserByEmail";
import {
  Loader2, Mail, IdCard, ArrowRight,
  CheckCircle2, Info, UserRound,
} from "lucide-react";

export type UserFormValues = CreateUserDto;

interface UserFormProps {
  onSubmit: (values: UserFormValues, existingUserId?: number) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
  error?: string | null;
}

type EmailStep = "typing" | "looking-up" | "found" | "not-found";

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email";
}

function validateName(v: string, label: string): string | undefined {
  if (!v.trim()) return `${label} is required`;
}

export function UserForm({
  onSubmit,
  submitLabel = "Confirm booking",
  isLoading = false,
  error = null,
}: UserFormProps) {
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailStep, setEmailStep] = useState<EmailStep>("typing");
  const [lookupEmail, setLookupEmail] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [namesTouched, setNamesTouched] = useState(false);
  const [foundUser, setFoundUser] = useState<GetUserResponseDto | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { refetch, isFetching } = useQuery({
    ...getUserByEmailQuery(lookupEmail),
    enabled: false,
  });

  function handleEmailChange(value: string) {
    setEmail(value);
    setEmailStep("typing");
    setFoundUser(null);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (validateEmail(value)) return;

    debounceTimer.current = setTimeout(async () => {
      setLookupEmail(value);
      setEmailStep("looking-up");

      await new Promise((r) => setTimeout(r, 0));

      const { data, error: fetchError } = await refetch();
      if (fetchError || !data) {
        setEmailStep("not-found");
        setFirstName("");
        setLastName("");
      } else {
        setEmailStep("found");
        setFoundUser(data);
        setFirstName(data.firstName);
        setLastName(data.lastName);
      }
    }, 500);
  }

  const emailError    = emailTouched || submitted ? validateEmail(email) : undefined;
  const firstNameError = (namesTouched || submitted) ? validateName(firstName, "First name") : undefined;
  const lastNameError  = (namesTouched || submitted) ? validateName(lastName,  "Last name")  : undefined;
  const nameFieldsReady = emailStep === "found" || emailStep === "not-found";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setNamesTouched(true);
    if (validateEmail(email)) return;
    if (validateName(firstName, "First name") || validateName(lastName, "Last name")) return;
    await onSubmit({ email, firstName, lastName }, foundUser?.id);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Email
        </label>
        <div className="relative">
          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            placeholder="jane@example.com"
            autoComplete="email"
            disabled={isLoading}
            className={`w-full pl-9 pr-9 py-2.5 rounded-xl border text-sm bg-background transition focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50
              ${emailError ? "border-destructive focus:ring-destructive/40" : "border-border"}`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {isFetching || emailStep === "looking-up" ? (
              <Loader2 size={14} className="animate-spin text-muted-foreground" />
            ) : emailStep === "found" ? (
              <CheckCircle2 size={14} className="text-emerald-500" />
            ) : emailStep === "not-found" ? (
              <UserRound size={14} className="text-muted-foreground" />
            ) : null}
          </span>
        </div>
        {emailError && <p className="text-xs text-destructive">{emailError}</p>}
        {emailStep === "found" && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={11} /> Welcome back! We filled in your details.
          </p>
        )}
        {emailStep === "not-found" && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <UserRound size={11} /> Email not found — we&apos;ll create an account for you.
          </p>
        )}
      </div>

      <div
        className={`grid grid-cols-2 gap-3 transition-all duration-300 origin-top ${
          nameFieldsReady
            ? "opacity-100 scale-y-100 max-h-40"
            : "opacity-0 scale-y-95 max-h-0 overflow-hidden pointer-events-none"
        }`}
      >
        <NameField
          label="First name"
          value={firstName}
          onChange={setFirstName}
          onBlur={() => setNamesTouched(true)}
          error={firstNameError}
          placeholder="Jane"
          disabled={isLoading || emailStep === "found"}
          locked={emailStep === "found"}
        />
        <NameField
          label="Last name"
          value={lastName}
          onChange={setLastName}
          onBlur={() => setNamesTouched(true)}
          error={lastNameError}
          placeholder="Smith"
          disabled={isLoading || emailStep === "found"}
          locked={emailStep === "found"}
        />
        {emailStep === "found" && (
          <div className="col-span-2 flex items-start gap-2 text-xs text-muted-foreground bg-muted/60 rounded-lg px-3 py-2">
            <Info size={12} className="shrink-0 mt-0.5" />
            <span>
              Need to update your name or last name?{" "}
              <span className="font-semibold">Please contact support</span> and
              we&apos;ll get it sorted for you.
            </span>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading || !nameFieldsReady}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm tracking-wide transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed mt-1"
      >
        {isLoading ? (
          <><Loader2 size={15} className="animate-spin" /> Please wait…</>
        ) : !nameFieldsReady ? (
          <><Mail size={15} /> Enter your email to continue</>
        ) : (
          <><ArrowRight size={15} /> {submitLabel}</>
        )}
      </button>
    </form>
  );
}

interface NameFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string;
  placeholder: string;
  disabled: boolean;
  locked: boolean;
}

function NameField({ label, value, onChange, onBlur, error, placeholder, disabled, locked }: NameFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <IdCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={label === "First name" ? "given-name" : "family-name"}
          className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm bg-background transition focus:outline-none focus:ring-2 focus:ring-ring
            ${locked ? "opacity-60 cursor-not-allowed" : ""}
            ${error ? "border-destructive focus:ring-destructive/40" : "border-border"}`}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}