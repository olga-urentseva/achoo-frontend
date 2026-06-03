import { describe, it, expect } from "vitest";
import { project } from "./project";
import { MAP_WIDTH, MAP_HEIGHT } from "./mapMeta";

describe("project", () => {
  it("places Andorra (42.5N, 1.5E) where the SVG draws it (~480, ~332)", () => {
    const { x, y } = project(42.5, 1.5);
    expect(x).toBeGreaterThan(475);
    expect(x).toBeLessThan(485);
    expect(y).toBeGreaterThan(327);
    expect(y).toBeLessThan(337);
  });

  it("maps the left/top geo edge to the box origin", () => {
    const { x, y } = project(83.600842, -169.110266);
    expect(x).toBeCloseTo(0, 3);
    expect(y).toBeCloseTo(0, 3);
  });

  it("maps the right/bottom geo edge to the box corner", () => {
    const { x, y } = project(-58.508473, 190.486279);
    expect(x).toBeCloseTo(MAP_WIDTH, 3);
    expect(y).toBeCloseTo(MAP_HEIGHT, 3);
  });
});
