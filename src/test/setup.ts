import "@testing-library/jest-dom/vitest";

// jsdom ships <dialog> but its showModal/close throw "Not implemented", so stub
// the bit our Modal relies on: toggling `open` and firing `close` on dismissal.
HTMLDialogElement.prototype.showModal = function showModal() {
  this.open = true;
};
HTMLDialogElement.prototype.close = function close() {
  this.open = false;
  this.dispatchEvent(new Event("close"));
};
