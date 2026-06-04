import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SeveritySelector } from "./SeveritySelector";

describe("SeveritySelector", () => {
  it("renders one radio per step, all under the same name", () => {
    render(<SeveritySelector name="severity" min={1} max={3} />);
    const radios = screen.getAllByRole<HTMLInputElement>("radio");
    expect(radios).toHaveLength(3);
    expect(radios.every((r) => r.name === "severity")).toBe(true);
  });

  it("starts with nothing selected, then checks the clicked step", async () => {
    render(<SeveritySelector name="severity" min={1} max={3} />);
    expect(screen.queryByRole("radio", { checked: true })).toBeNull();
    await userEvent.click(screen.getByRole("radio", { name: "2" }));
    expect(screen.getByRole("radio", { name: "2" })).toBeChecked();
  });
});
