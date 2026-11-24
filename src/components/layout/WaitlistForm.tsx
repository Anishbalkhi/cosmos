"use client";

import { useId, useState } from "react";
import clsx from "clsx";

/** UI only for now: wire to POST /api/waitlist (Payload) in the backend phase. */
export function WaitlistForm({ className, size = "md" }: { className?: string; size?: "md" | "lg" }) {
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "done" | "error">("idle");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setState("error");
      return;
    }
    setState("done");
  }

  if (state === "done") {
    return (
      <p className={clsx("rounded-full border border-leaf/40 bg-leaf/10 px-6 py-3.5 text-sm text-leaf", className)} role="status">
        You’re in orbit. We’ll write on launch day.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className={clsx("w-full", className)} noValidate>
      <div
        className={clsx(
          "flex items-center gap-2 rounded-full border bg-space-2/80 p-1.5 pl-5 backdrop-blur transition-colors focus-within:border-flare",
          state === "error" ? "border-red-400" : "border-line",
        )}
      >
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <input
          id={inputId}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setState("idle");
          }}
          className={clsx("min-w-0 flex-1 bg-transparent outline-none placeholder:text-dust/70", size === "lg" ? "h-12 text-base" : "h-10 text-sm")}
        />
        <button
          type="submit"
          className={clsx(
            "shrink-0 rounded-full bg-flare font-semibold text-space transition-colors hover:bg-flare-soft",
            size === "lg" ? "h-12 px-6 text-sm" : "h-10 px-5 text-xs",
          )}
        >
          Join the orbit
        </button>
      </div>
      {state === "error" && <p className="mt-2 pl-5 text-xs text-red-300">Please enter a valid email.</p>}
    </form>
  );
}
