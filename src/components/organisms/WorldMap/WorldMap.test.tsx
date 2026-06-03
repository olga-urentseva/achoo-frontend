import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorldMap } from "./WorldMap";
import type { RegionStatus } from "../../../types";

function region(over: Partial<RegionStatus>): RegionStatus {
  return {
    regionId: 1,
    name: "London",
    admin1: "England",
    country: "GB",
    lat: 51.5,
    lng: -0.13,
    date: "2026-06-03",
    reportCount: 3,
    avgSeverity: 2.5,
    color: "yellow",
    ...over,
  };
}

describe("WorldMap", () => {
  it("summarises total reports and region count", () => {
    render(
      <WorldMap
        regions={[
          region({ regionId: 1, reportCount: 3 }),
          region({ regionId: 2, name: "Paris", reportCount: 2 }),
        ]}
      />,
    );
    expect(screen.getByText(/across 2 regions today/)).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows an empty state when nobody has reported", () => {
    render(<WorldMap regions={[]} />);
    expect(screen.getByText("No reports yet today")).toBeInTheDocument();
  });
});
