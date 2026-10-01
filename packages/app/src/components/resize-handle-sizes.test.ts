import { describe, expect, it } from "vitest";
import { computeResizeHandleSizes, resolveSplitGroupSizes } from "@/components/resize-handle-sizes";

describe("computeResizeHandleSizes", () => {
  it("clamps right-edge drags to the adjacent pane minimum", () => {
    const sizes = computeResizeHandleSizes({
      sizes: [0.25, 0.5, 0.25],
      index: 1,
      deltaRatio: 0.5,
    });

    expect(sizes[0]).toBe(0.25);
    expect(sizes[1]).toBe(0.65);
    expect(sizes[2]).toBeCloseTo(0.1, 10);
  });

  it("clamps left-edge drags to the adjacent pane minimum", () => {
    const sizes = computeResizeHandleSizes({
      sizes: [0.25, 0.5, 0.25],
      index: 1,
      deltaRatio: -0.5,
    });

    expect(sizes[0]).toBe(0.25);
    expect(sizes[1]).toBe(0.1);
    expect(sizes[2]).toBeCloseTo(0.65, 10);
  });

  it("moves adjacent pane sizes without clamping", () => {
    const sizes = computeResizeHandleSizes({
      sizes: [0.25, 0.5, 0.25],
      index: 1,
      deltaRatio: 0.05,
    });

    expect(sizes[0]).toBe(0.25);
    expect(sizes[1]).toBe(0.55);
    expect(sizes[2]).toBeCloseTo(0.2, 10);
  });

  it("splits tiny adjacent pairs evenly when the configured minimum cannot fit", () => {
    expect(
      computeResizeHandleSizes({
        sizes: [0.45, 0.05, 0.05, 0.45],
        index: 1,
        deltaRatio: 0.05,
      }),
    ).toEqual([0.45, 0.05, 0.05, 0.45]);
  });

  it("leaves sizes unchanged when the adjacent pair is invalid", () => {
    expect(
      computeResizeHandleSizes({
        sizes: [0.25, 0.5, 0.25],
        index: 3,
        deltaRatio: 0.25,
      }),
    ).toEqual([0.25, 0.5, 0.25]);
    expect(
      computeResizeHandleSizes({
        sizes: [0.25, 0, 0, 0.75],
        index: 1,
        deltaRatio: 0.25,
      }),
    ).toEqual([0.25, 0, 0, 0.75]);
  });
});

describe("resolveSplitGroupSizes", () => {
  it("uses stored sizes that match the group's children", () => {
    expect(
      resolveSplitGroupSizes({ storedSizes: [0.7, 0.3], groupSizes: [0.5, 0.5], childCount: 2 }),
    ).toEqual([0.7, 0.3]);
  });

  it("falls back to the group sizes once a pane joins the group", () => {
    expect(
      resolveSplitGroupSizes({
        storedSizes: [0.7, 0.3],
        groupSizes: [1 / 3, 1 / 3, 1 / 3],
        childCount: 3,
      }),
    ).toEqual([1 / 3, 1 / 3, 1 / 3]);
  });

  it("keeps every handle of a grown group resizable", () => {
    const sizes = resolveSplitGroupSizes({
      storedSizes: [0.7, 0.3],
      groupSizes: [1 / 3, 1 / 3, 1 / 3],
      childCount: 3,
    });
    const resized = computeResizeHandleSizes({ sizes, index: 1, deltaRatio: 0.1 });

    expect(resized[1]).toBeCloseTo(1 / 3 + 0.1, 10);
    expect(resized[2]).toBeCloseTo(1 / 3 - 0.1, 10);
  });

  it("uses the group sizes when nothing is stored", () => {
    expect(
      resolveSplitGroupSizes({ storedSizes: undefined, groupSizes: [0.5, 0.5], childCount: 2 }),
    ).toEqual([0.5, 0.5]);
  });
});
