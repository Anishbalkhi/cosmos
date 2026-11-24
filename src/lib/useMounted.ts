"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** True on the client, false during server render — use before reading browser-only state (cart). */
export function useMounted() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
