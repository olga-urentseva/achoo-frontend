import { post } from "../lib/http";
import type { CreateReportInput, Report } from "../types";

export default async function createReport(input: CreateReportInput): Promise<Report> {
  return post<Report>("/reports", input);
}
