import type { PlayerColor } from "./types";

export const COLORS: PlayerColor[] = ["red", "green", "yellow", "blue"];
export const TOTAL_TRACK_SQUARES = 52;
export const HOME_LANE_LENGTH = 6;

export const COLOR_ENTRY: Record<PlayerColor, number> = {
  red: 0, green: 13, yellow: 26, blue: 38,
};

export const HOME_LANE_ENTRY: Record<PlayerColor, number> = {
  red: 51, green: 11, yellow: 25, blue: 39,
};

export const SAFE_SQUARES: Set<number> = new Set([0, 8, 13, 21, 26, 34, 38, 47]);
export const STAR_SQUARES: Set<number> = new Set([8, 21, 34, 47]);
export const STARTING_SQUARES: Set<number> = new Set(Object.values(COLOR_ENTRY));

export const TOKENS_PER_PLAYER = 4;

export const DEFAULT_CONFIG = {
  playerCount: 4 as const,
  blockRule: false,
  captureBonus: false,
  threeConsecSixes: "skip" as const,
};

// Color mappings for rendering
export const COLOR_HEX: Record<PlayerColor, string> = {
  red: "#E63946",
  green: "#2DC653",
  yellow: "#FFBE0B",
  blue: "#4361EE",
};

export const COLOR_LIGHT: Record<PlayerColor, string> = {
  red: "#fde8ea",
  green: "#e0f7e9",
  yellow: "#fff8e0",
  blue: "#e8edff",
};
