import { get } from "../lib/http";
import type { CrossReactivityGroup } from "../types";

let promise: Promise<CrossReactivityGroup[]> | undefined;

/**
 * Fetches the shared-protein map once and returns the same promise on every
 * call, so it's stable across renders and safe to read with the `use` hook. No
 * personal data — it's paired with the user's local plant list on-device. On
 * failure the promise is cleared so an ErrorBoundary retry re-fetches.
 */
export default function getCrossReactivity(): Promise<CrossReactivityGroup[]> {
  promise ??= get<CrossReactivityGroup[]>("/meta/cross-reactivity").catch(
    (err) => {
      promise = undefined;
      throw err;
    },
  );
  return promise;
}
