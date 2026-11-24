"use client";

import clsx from "clsx";
import { useExperience } from "@/lib/experience";
import { ambient } from "@/lib/ambient";

/** Noomo-style sound pill: animated waveform + ON/OFF. */
export function SoundToggle({ className, label = true }: { className?: string; label?: boolean }) {
  const sound = useExperience((s) => s.sound);
  const setSound = useExperience((s) => s.setSound);
  return (
    <button
      type="button"
      onClick={() => {
        const next = !sound;
        setSound(next);
        ambient.setOn(next);
      }}
      aria-pressed={sound}
      aria-label={sound ? "Turn sound off" : "Turn sound on"}
      className={clsx(
        "inline-flex h-10 items-center gap-3 rounded-full border border-white/15 bg-black/50 px-4 font-mono text-[11px] tracking-[0.18em] uppercase backdrop-blur transition-colors hover:border-white/40",
        className,
      )}
    >
      <span className="flex h-4 items-center gap-[3px]" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={clsx("w-[2px] rounded-full bg-star", sound ? "animate-[eq_1s_ease-in-out_infinite]" : "")}
            style={{ height: sound ? undefined : 3, animationDelay: `${i * -0.18}s` }}
          />
        ))}
      </span>
      {label && <span>{sound ? "Sound on" : "Sound off"}</span>}
    </button>
  );
}
