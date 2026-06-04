import { post } from "../lib/http";
import type { CreateReportInput, Report } from "../types";

/** Submit one anonymous report per reacting allergen; the server fans them out. */
export default async function createReport(
  input: CreateReportInput,
): Promise<Report[]> {
  return post<Report[]>("/reports", input);
}
