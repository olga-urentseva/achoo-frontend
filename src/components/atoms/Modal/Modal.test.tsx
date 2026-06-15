import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("opens the native dialog when `open` is true", () => {
    render(
      <Modal open onClose={() => {}} title="How this works">
        <p>Body</p>
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeVisible();
  });

  it("labels the dialog by its title for screen readers", () => {
    render(
      <Modal open onClose={() => {}} title="How this works">
        <p>Body</p>
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toHaveAccessibleName("How this works");
  });

  it("calls onClose when the close button is pressed", async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="How this works">
        <p>Body</p>
      </Modal>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose on the native close event (e.g. Escape)", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="How this works">
        <p>Body</p>
      </Modal>,
    );
    screen.getByRole("dialog").dispatchEvent(new Event("close"));
    expect(onClose).toHaveBeenCalled();
  });
});
