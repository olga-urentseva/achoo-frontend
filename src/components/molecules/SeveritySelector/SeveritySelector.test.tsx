import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SeveritySelector } from "./SeveritySelector";

describe("SeveritySelector", () => {
  it("renders one button per step in the range", () => {
    render(<SeveritySelector min={1} max={3} value={null} onChange={() => {}} />);
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("marks the selected step with aria-pressed", () => {
    render(<SeveritySelector min={1} max={3} value={2} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "1" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("reports the chosen step", async () => {
    const onChange = vi.fn();
    render(<SeveritySelector min={1} max={3} value={null} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "3" }));
    expect(onChange).toHaveBeenCalledWith(3);
  });
});
