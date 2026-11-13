import type { PlayerColor, Token } from "./types";
import {
  COLOR_ENTRY,
  HOME_LANE_LENGTH,
  TOTAL_TRACK_SQUARES,
} from "./constants";

export const CELL = 40;
export const BOARD_SIZE = 600;

export const TRACK_GRID: [number, number][] = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7], [0, 8],
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14], [8, 14],
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [8, 8],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7], [14, 6],
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1],
];

export const HOME_LANE_GRID: Record<PlayerColor, [number, number][]> = {
  red:    [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
  green:  [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
  yellow: [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
  blue:   [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
};

export const BASE_GRID: Record<PlayerColor, [number, number][]> = {
  red:    [[1,1],[2,1],[1,2],[2,2]],
  green:  [[1,11],[2,11],[1,12],[2,12]],
  yellow: [[11,11],[12,11],[11,12],[12,12]],
  blue:   [[11,1],[12,1],[11,2],[12,2]],
};

export function tokenScreenPos(token: Token): { x: number; y: number } {
  let col: number;
  let row: number;

  if (token.status === "base") {
    [col, row] = BASE_GRID[token.color][token.index];
  } else if (token.status === "track") {
    [col, row] = TRACK_GRID[token.trackPos];
  } else if (token.status === "home_lane") {
    [col, row] = HOME_LANE_GRID[token.color][token.trackPos];
  } else {
    const nudge = [
      [0, 0], [-0.15, 0.1], [0.15, 0.1], [0, -0.15],
    ][token.index];
    [col, row] = HOME_LANE_GRID[token.color][5];
    return {
      x: (col + nudge[0]) * CELL + CELL / 2,
      y: (row + nudge[1]) * CELL + CELL / 2,
    };
  }

  return {
    x: col * CELL + CELL / 2,
    y: row * CELL + CELL / 2,
  };
}

export function relativeToAbsolute(color: PlayerColor, relativePos: number): number {
  return (COLOR_ENTRY[color] + relativePos) % TOTAL_TRACK_SQUARES;
}

export function absoluteToRelative(color: PlayerColor, absolutePos: number): number {
  return (absolutePos - COLOR_ENTRY[color] + TOTAL_TRACK_SQUARES) % TOTAL_TRACK_SQUARES;
}
