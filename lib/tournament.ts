import type { TournamentState } from "@/types";
import { TOP_N } from "@/types";

function ceilLog2(n: number): number {
  if (n <= 1) return 0;
  return Math.ceil(Math.log2(n));
}

export function estimateTotalComparisons(n: number, k: number = TOP_N): number {
  if (n <= 1) return 0;
  if (n <= k) return n - 1;
  return (n - 1) + (k - 1) * ceilLog2(n);
}

export function cloneState(state: TournamentState): TournamentState {
  return {
    size: state.size,
    nodes: [...state.nodes],
    phase: state.phase,
    topK: [...state.topK],
    pendingPair: state.pendingPair ? [...state.pendingPair] : null,
    totalComparisons: state.totalComparisons,
  };
}

export function initTournament(movieIds: number[]): TournamentState {
  const n = movieIds.length;
  if (n === 0) {
    return {
      size: 0,
      nodes: [],
      phase: "building",
      topK: [],
      pendingPair: null,
      totalComparisons: 0,
    };
  }

  let size = 1;
  while (size < n) size *= 2;

  const nodes: (number | null)[] = new Array(2 * size).fill(null);
  for (let i = 0; i < n; i++) {
    nodes[size + i] = movieIds[i];
  }

  return {
    size,
    nodes,
    phase: "building",
    topK: [],
    pendingPair: null,
    totalComparisons: 0,
  };
}

function findLeafOf(state: TournamentState, champion: number): number {
  let node = 1;
  while (node < state.size) {
    const left = 2 * node;
    const right = 2 * node + 1;
    if (state.nodes[left] === champion) {
      node = left;
    } else if (state.nodes[right] === champion) {
      node = right;
    } else {
      break;
    }
  }
  return node;
}

function advanceBuilding(state: TournamentState): [number, number] | null {
  for (let i = state.size - 1; i >= 1; i--) {
    if (state.nodes[i] !== null) continue;

    const left = 2 * i;
    const right = 2 * i + 1;
    const leftVal = state.nodes[left];
    const rightVal = state.nodes[right];

    if (leftVal !== null && rightVal !== null) {
      state.pendingPair = [left, right];
      return [leftVal, rightVal];
    }

    if (leftVal !== null) {
      state.nodes[i] = leftVal;
    } else if (rightVal !== null) {
      state.nodes[i] = rightVal;
    }
  }

  if (state.nodes[1] !== null) {
    state.phase = "extracting";
    return advanceExtracting(state);
  }

  return null;
}

function advanceExtracting(state: TournamentState): [number, number] | null {
  if (state.topK.length >= TOP_N) return null;
  if (state.nodes[1] === null) return null;

  const champion = state.nodes[1]!;
  state.topK.push(champion);

  const leaf = findLeafOf(state, champion);
  state.nodes[leaf] = null;

  let current = leaf;
  while (current > 1) {
    const parent = Math.floor(current / 2);
    const sibling = current % 2 === 0 ? current + 1 : current - 1;
    const currentVal = state.nodes[current];
    const siblingVal = state.nodes[sibling];

    if (currentVal !== null && siblingVal !== null) {
      state.pendingPair = [current, sibling];
      return [currentVal, siblingVal];
    }

    state.nodes[parent] = currentVal ?? siblingVal;
    current = parent;
  }

  return advanceExtracting(state);
}

export function getNextPair(state: TournamentState): [number, number] | null {
  if (state.pendingPair) {
    const [leftIdx, rightIdx] = state.pendingPair;
    const a = state.nodes[leftIdx];
    const b = state.nodes[rightIdx];
    if (a !== null && b !== null) {
      return [a, b];
    }
    state.pendingPair = null;
  }

  if (state.phase === "building") {
    return advanceBuilding(state);
  } else {
    return advanceExtracting(state);
  }
}

export function applyResult(state: TournamentState, winnerMovieId: number): void {
  if (!state.pendingPair) return;

  const [leftIdx, rightIdx] = state.pendingPair;
  const parent = Math.floor(leftIdx / 2);
  state.nodes[parent] = winnerMovieId;
  state.pendingPair = null;
  state.totalComparisons++;

  if (state.phase === "extracting") {
    let current = parent;
    while (current > 1) {
      const p = Math.floor(current / 2);
      const sibling = current % 2 === 0 ? current + 1 : current - 1;
      const currentVal = state.nodes[current];
      const siblingVal = state.nodes[sibling];

      if (currentVal !== null && siblingVal !== null) {
        state.pendingPair = [current, sibling];
        return;
      }

      state.nodes[p] = currentVal ?? siblingVal;
      current = p;
    }
  }
}

export function isComplete(state: TournamentState | null): boolean {
  if (!state) return false;
  if (state.topK.length >= TOP_N) return true;
  if (state.phase === "extracting" && state.nodes[1] === null) return true;
  return false;
}

export function getProgress(state: TournamentState | null, totalMovies: number): number {
  if (!state || totalMovies === 0) return 0;
  const estimated = estimateTotalComparisons(totalMovies);
  if (estimated === 0) return 1;
  return Math.min(1, state.totalComparisons / estimated);
}

export function getTopK(state: TournamentState | null): number[] {
  if (!state) return [];
  return state.topK;
}
