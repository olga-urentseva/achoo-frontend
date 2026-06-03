import type { CreateReportInput, Meta, Place, Report } from "./types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, body: unknown) {
    super(messageFromBody(body) ?? `Request failed (${status})`);
    this.status = status;
    this.name = "ApiError";
  }
}

/** Pull a human message out of our API's error shapes (NotFound or Zod). */
function messageFromBody(body: unknown): string | undefined {
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    if (typeof b.error === "string") return b.error;
    const zodIssue = (b.error as { issues?: { message?: string }[] } | undefined)
      ?.issues?.[0]?.message;
    if (zodIssue) return zodIssue;
  }
  return undefined;
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getMeta: () => http<Meta>("/meta"),

  searchPlaces: (q: string, limit = 8) =>
    http<Place[]>(
      `/places/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    ),

  createReport: (input: CreateReportInput) =>
    http<Report>("/reports", {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
