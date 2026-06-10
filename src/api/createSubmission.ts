import { post } from "../lib/http";
import type { CreateSubmissionInput, Submission } from "../types";

/**
 * Submit one anonymous report: a single severity plus the plants the user
 * reacts to (or `unknown: true`). The server maps the plants to families,
 * folds them into the daily rollups, and discards them — nothing per-person
 * is stored. Returns the stored submission (no plant fields).
 */
export default async function createSubmission(
  input: CreateSubmissionInput,
): Promise<Submission> {
  return post<Submission>("/reports", input);
}
