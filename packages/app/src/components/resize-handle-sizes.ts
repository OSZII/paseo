import { MIN_SPLIT_SIZE } from "@/stores/workspace-layout-constants";

interface ComputeResizeHandleSizesInput {
  sizes: number[];
  index: number;
  deltaRatio: number;
  minSize?: number;
}

export function computeResizeHandleSizes({
  sizes,
  index,
  deltaRatio,
  minSize = MIN_SPLIT_SIZE,
}: ComputeResizeHandleSizesInput): number[] {
  const nextSizes = sizes.slice();
  const leftSize = sizes[index];
  const rightSize = sizes[index + 1];
  if (leftSize === undefined || rightSize === undefined) {
    return nextSizes;
  }

  const pairSize = leftSize + rightSize;
  if (pairSize <= 0) {
    return nextSizes;
  }

  const adjacentMinSize = Math.min(minSize, pairSize / 2);
  const nextLeftSize = Math.min(
    pairSize - adjacentMinSize,
    Math.max(adjacentMinSize, leftSize + deltaRatio),
  );
  nextSizes[index] = nextLeftSize;
  nextSizes[index + 1] = pairSize - nextLeftSize;
  return nextSizes;
}

interface ResolveSplitGroupSizesInput {
  storedSizes: number[] | undefined;
  groupSizes: number[];
  childCount: number;
}

/**
 * Stored sizes are keyed by group id, and a group keeps its id when panes join or leave it. A
 * stored entry from before that change has the wrong length: the handles past its end can't move
 * and the extra panes get a fixed width. Only trust stored sizes that still have one entry per child.
 */
export function resolveSplitGroupSizes({
  storedSizes,
  groupSizes,
  childCount,
}: ResolveSplitGroupSizesInput): number[] {
  return storedSizes?.length === childCount ? storedSizes : groupSizes;
}
