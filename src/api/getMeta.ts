import { get } from "../lib/http";
import type { Meta } from "../types";

let promise: Promise<Meta> | undefined;

/**
 * Fetches /meta once and returns the same promise on every call, so it's stable
 * across renders and safe to read with the `use` hook. On failure the promise
 * is cleared, so an ErrorBoundary retry re-fetches instead of replaying the error.
 */
export default function getMeta(): Promise<Meta> {
  promise ??= get<Meta>("/meta").catch((err) => {
    promise = undefined;
    throw err;
  });
  return promise;
}
