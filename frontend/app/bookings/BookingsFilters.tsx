"use client";

import { useState, KeyboardEvent } from "react";
import { X, RotateCcw, Hash, Mail, User, FileText, IdCard } from "lucide-react";
import { QUERY_LIMITS, QUERY_SORT_ORDERS } from "@/lib/query.lib";
import { BookingSortFields } from "@/types/booking.type";

interface FiltersState {
  ids?: number[] | null;
  externalIds?: string[] | null;
  confirmationNumbers?: string[] | null;
  userIds?: number[] | null;
  emails?: string[] | null;
  firstNames?: string[] | null;
  lastNames?: string[] | null;
  sortField?: typeof BookingSortFields[number];
  sortOrder?: typeof QUERY_SORT_ORDERS[number];
  limit?: number;
}

interface BookingsFiltersProps {
  query: FiltersState;
  onChange: (patch: Partial<FiltersState>) => void;
  onReset: () => void;
}

export function BookingsFilters({ query, onChange, onReset }: BookingsFiltersProps) {
  const hasAnyFilter =
    (query.ids?.length ?? 0) > 0 ||
    (query.externalIds?.length ?? 0) > 0 ||
    (query.confirmationNumbers?.length ?? 0) > 0 ||
    (query.userIds?.length ?? 0) > 0 ||
    (query.emails?.length ?? 0) > 0 ||
    (query.firstNames?.length ?? 0) > 0 ||
    (query.lastNames?.length ?? 0) > 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold">Filters</span>
        {hasAnyFilter && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
          >
            <RotateCcw size={11} />
            Reset all
          </button>
        )}
      </div>

      <TagInput
        label="Booking ID"
        icon={<Hash size={12} />}
        placeholder="e.g. 1, 2…"
        tags={(query.ids ?? []).map(String)}
        onAdd={(v) => {
          const n = parseInt(v, 10);
          if (!isNaN(n)) onChange({ ids: [...(query.ids ?? []), n] });
        }}
        onRemove={(i) =>
          onChange({ ids: (query.ids ?? []).filter((_, idx) => idx !== i) })
        }
        validateInput={(v) => !isNaN(parseInt(v, 10))}
        validationMessage="Must be a number"
      />

      <TagInput
        label="Confirmation #"
        icon={<FileText size={12} />}
        placeholder="e.g. Booking-000…"
        tags={query.confirmationNumbers ?? []}
        onAdd={(v) =>
          onChange({ confirmationNumbers: [...(query.confirmationNumbers ?? []), v.trim()] })
        }
        onRemove={(i) =>
          onChange({
            confirmationNumbers: (query.confirmationNumbers ?? []).filter((_, idx) => idx !== i),
          })
        }
      />

      <TagInput
        label="External ID"
        icon={<IdCard size={12} />}
        placeholder="e.g. EXT-123…"
        tags={query.externalIds ?? []}
        onAdd={(v) =>
          onChange({ externalIds: [...(query.externalIds ?? []), v.trim()] })
        }
        onRemove={(i) =>
          onChange({
            externalIds: (query.externalIds ?? []).filter((_, idx) => idx !== i),
          })
        }
      />

      <hr className="border-border" />

      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider -mb-2">
        User
      </p>

      <TagInput
        label="User ID"
        icon={<Hash size={12} />}
        placeholder="e.g. 1, 2…"
        tags={(query.userIds ?? []).map(String)}
        onAdd={(v) => {
          const n = parseInt(v, 10);
          if (!isNaN(n)) onChange({ userIds: [...(query.userIds ?? []), n] });
        }}
        onRemove={(i) =>
          onChange({ userIds: (query.userIds ?? []).filter((_, idx) => idx !== i) })
        }
        validateInput={(v) => !isNaN(parseInt(v, 10))}
        validationMessage="Must be a number"
      />

      <TagInput
        label="Email"
        icon={<Mail size={12} />}
        placeholder="e.g. jane@example.com"
        tags={query.emails ?? []}
        onAdd={(v) => onChange({ emails: [...(query.emails ?? []), v.trim()] })}
        onRemove={(i) =>
          onChange({ emails: (query.emails ?? []).filter((_, idx) => idx !== i) })
        }
        validateInput={(v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())}
        validationMessage="Enter a valid email address"
      />

      <TagInput
        label="First name"
        icon={<User size={12} />}
        placeholder="e.g. Jane"
        tags={query.firstNames ?? []}
        onAdd={(v) =>
          onChange({ firstNames: [...(query.firstNames ?? []), v.trim()] })
        }
        onRemove={(i) =>
          onChange({
            firstNames: (query.firstNames ?? []).filter((_, idx) => idx !== i),
          })
        }
      />

      <TagInput
        label="Last name"
        icon={<User size={12} />}
        placeholder="e.g. Smith"
        tags={query.lastNames ?? []}
        onAdd={(v) =>
          onChange({ lastNames: [...(query.lastNames ?? []), v.trim()] })
        }
        onRemove={(i) =>
          onChange({
            lastNames: (query.lastNames ?? []).filter((_, idx) => idx !== i),
          })
        }
      />

      <hr className="border-border" />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Sort by
        </label>
        <select
          className="w-full appearance-none px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={query.sortField ?? "createdAt"}
          onChange={(e) =>
            onChange({ sortField: e.target.value as typeof BookingSortFields[number] })
          }
        >
          {BookingSortFields.map((f) => (
            <option key={f} value={f}>
              {sortFieldLabel(f)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        {QUERY_SORT_ORDERS.map((order) => (
          <button
            key={order}
            onClick={() => onChange({ sortOrder: order })}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition
              ${query.sortOrder === order
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-primary/40 bg-background"
              }`}
          >
            {order === "ASC" ? "↑ Ascending" : "↓ Descending"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Rows per page
        </label>
        <div className="flex gap-2 flex-wrap">
          {QUERY_LIMITS.map((l) => (
            <button
              key={l}
              onClick={() => onChange({ limit: l })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition
                ${query.limit === l
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary/40 bg-background"
                }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function sortFieldLabel(f: string) {
  const map: Record<string, string> = {
    id: "Booking ID",
    externalId: "External ID",
    confirmationNumber: "Confirmation #",
    createdAt: "Date created",
  };
  return map[f] ?? f;
}

interface TagInputProps {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  tags: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  validateInput?: (value: string) => boolean;
  validationMessage?: string;
}

function TagInput({
  label, icon, placeholder, tags, onAdd, onRemove, validateInput, validationMessage,
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [invalid, setInvalid] = useState(false);

  function commit() {
    const v = input.trim();
    if (!v) return;
    if (validateInput && !validateInput(v)) { setInvalid(true); return; }
    if (tags.includes(v)) { setInput(""); return; }
    onAdd(v);
    setInput("");
    setInvalid(false);
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); commit(); }
    if (e.key === "Backspace" && input === "" && tags.length > 0) {
      onRemove(tags.length - 1);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
        {icon}{label}
      </label>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
              {tag}
              <button onClick={() => onRemove(i)} className="hover:text-destructive transition" aria-label={`Remove ${tag}`}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        value={input}
        onChange={(e) => { setInput(e.target.value); setInvalid(false); }}
        onKeyDown={handleKey}
        onBlur={commit}
        placeholder={tags.length === 0 ? placeholder : "Add another…"}
        className={`w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 transition
          ${invalid ? "border-destructive focus:ring-destructive/40" : "border-border focus:ring-ring"}`}
      />
      {invalid && validationMessage
        ? <p className="text-xs text-destructive">{validationMessage}</p>
        : <p className="text-xs text-muted-foreground/70">Press Enter to add</p>
      }
    </div>
  );
}
