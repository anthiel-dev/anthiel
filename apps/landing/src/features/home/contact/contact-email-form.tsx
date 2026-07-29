import { ArrowUpIcon } from "lucide-react";
import { useId, useState, type FormEvent } from "react";

import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { createContactQuery } from "#lib/api";
import { cn } from "#lib/utils";

import { isValidEmail } from "../faq/utils";

const CONTACT_MESSAGE = "Homepage email drop — please get in touch.";

type Status = "idle" | "submitting" | "success" | "invalid" | "error" | "rate-limited";

export function ContactEmailForm() {
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [retryMinutes, setRetryMinutes] = useState(0);

  const isBusy = status === "submitting";
  const isDone = status === "success";
  const emailValid = isValidEmail(email.trim());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy || isDone) return;

    const value = email.trim();
    if (!value) return;

    if (!emailValid) {
      setStatus("invalid");
      return;
    }

    setStatus("submitting");

    try {
      const result = await createContactQuery({ email: value, message: CONTACT_MESSAGE });
      if (result.ok) {
        setStatus("success");
        setEmail("");
        return;
      }

      if (result.status === 429) {
        setRetryMinutes(Math.max(1, result.retryAfterMinutes));
        setStatus("rate-limited");
        return;
      }

      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (isDone) {
    return (
      <p className="faq-answer-enter text-sm tracking-tight text-white/80">
        Thanks — we&apos;ll get in touch soon.
      </p>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex w-full items-center gap-3">
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <Input
          id={inputId}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status !== "idle" && status !== "submitting") setStatus("idle");
          }}
          placeholder="you@company.com"
          className="min-w-0 flex-1 rounded-full text-base before:rounded-full sm:text-sm [&_[data-slot=input]]:h-12 [&_[data-slot=input]]:px-4 [&_[data-slot=input]]:text-base [&_[data-slot=input]]:leading-12 sm:[&_[data-slot=input]]:h-12 sm:[&_[data-slot=input]]:text-base sm:[&_[data-slot=input]]:leading-12"
          size="lg"
          disabled={isBusy}
          aria-invalid={status === "invalid" || undefined}
        />
        <Button
          type="submit"
          size="icon-xl"
          loading={isBusy}
          disabled={!emailValid || isBusy}
          aria-label="Send email"
          className={cn(
            "size-12 shrink-0 rounded-full text-white active:scale-[0.97] sm:size-12",
            "motion-safe:transition-[background-color,border-color,opacity,box-shadow,transform] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
            emailValid
              ? "border-orange-500 bg-orange-500 opacity-100 hover:bg-orange-500 data-pressed:bg-orange-500"
              : "border-primary/30 bg-primary/30 opacity-100 disabled:opacity-100",
          )}
        >
          <ArrowUpIcon
            strokeWidth={1.5}
            className={cn(
              "size-6 text-white opacity-100 motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
              emailValid && "rotate-90",
            )}
            aria-hidden
          />
        </Button>
      </form>

      <p
        className={cn(
          "mt-2 text-xxs transition-opacity duration-150 ease-out",
          status === "idle" ? "opacity-0" : "opacity-100",
          status === "invalid" || status === "error" || status === "rate-limited"
            ? "text-white/45"
            : "text-transparent",
        )}
        aria-live="polite"
      >
        {status === "invalid"
          ? "That doesn't look like an email — try again?"
          : status === "rate-limited"
            ? `A few messages already sent. Try again in about ${retryMinutes} minute${retryMinutes === 1 ? "" : "s"}.`
            : status === "error"
              ? "Something went wrong. Please try again in a moment."
              : "\u00a0"}
      </p>
    </div>
  );
}
