import type {
  PlayerColor,
  TokenStatus,
  Token,
  Player,
  DiceState,
  LegalMove,
  GameState,
  RoomConfig,
} from "./types";

import {
  COLORS,
  TOTAL_TRACK_SQUARES,
  HOME_LANE_LENGTH,
  COLOR_ENTRY,
  HOME_LANE_ENTRY,
  SAFE_SQUARES,
  TOKENS_PER_PLAYER,
  DEFAULT_CONFIG,
} from "./constants";

import { absoluteToRelative } from "./board";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTokenId(color: PlayerColor, index: number): string {
  return `${color}-${index}`;
}

function createTokens(color: PlayerColor): Token[] {
  return Array.from({ length: TOKENS_PER_PLAYER }, (_, i) => ({
    id: makeTokenId(color, i),
    color,
    index: i,
    status: "base" as TokenStatus,
    trackPos: -1,
  }));
}

function cloneState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state));
}

// ---------------------------------------------------------------------------
// State creation
// ---------------------------------------------------------------------------

export function createInitialState(
  roomId: string,
  players: { id: string; name: string }[],
  config: Partial<RoomConfig> = {},
): GameState {
  const merged: RoomConfig = { ...DEFAULT_CONFIG, ...config } as RoomConfig;
  const count = Math.min(players.length, merged.playerCount) as 2 | 3 | 4;
  const activeColors = COLORS.slice(0, count);

  const gamePlayers: Player[] = players.slice(0, count).map((p, i) => ({
    id: p.id,
    color: activeColors[i],
    seatIndex: i,
    name: p.name,
    connected: true,
    tokens: createTokens(activeColors[i]),
  }));

  return {
    roomId,
    phase: "waiting",
    players: gamePlayers,
    activePlayerIndex: 0,
    dice: { value: null, rolledAt: null, rollCount: 0, used: true },
    legalMoves: [],
    turnNumber: 0,
    winner: null,
    config: merged,
    actionSeq: 0,
  };
}

// ---------------------------------------------------------------------------
// Player accessors
// ---------------------------------------------------------------------------

export function getActivePlayer(state: GameState): Player {
  return state.players[state.activePlayerIndex];
}

export function getPlayerById(state: GameState, playerId: string): Player | undefined {
  return state.players.find((p) => p.id === playerId);
}

// ---------------------------------------------------------------------------
// Dice
// ---------------------------------------------------------------------------

export function canRoll(state: GameState, playerId: string): boolean {
  if (state.phase !== "playing") return false;
  const active = getActivePlayer(state);
  if (active.id !== playerId) return false;
  return state.dice.used;
}

export function applyRoll(state: GameState, diceValue: number): GameState {
  const next = cloneState(state);
  next.dice = {
    value: diceValue,
    rolledAt: Date.now(),
    rollCount: next.dice.rollCount + 1,
    used: false,
  };
  next.actionSeq += 1;

  // Compute legal moves for the active player
  next.legalMoves = computeLegalMoves(next);

  // If no legal moves, mark dice as used (turn will auto-advance)
  if (next.legalMoves.length === 0) {
    next.dice.used = true;
  }

  return next;
}

// ---------------------------------------------------------------------------
// Legal moves
// ---------------------------------------------------------------------------

export function computeLegalMoves(state: GameState): LegalMove[] {
  const player = getActivePlayer(state);
  const dice = state.dice.value;
  if (dice === null) return [];

  const moves: LegalMove[] = [];

  for (const token of player.tokens) {
    const move = computeMoveForToken(state, token, dice, player.color);
    if (move) moves.push(move);
  }

  return moves;
}

function computeMoveForToken(
  state: GameState,
  token: Token,
  dice: number,
  color: PlayerColor,
): LegalMove | null {
  if (token.status === "finished") return null;

  // Token in base: needs a 6 to enter
  if (token.status === "base") {
    if (dice !== 6) return null;
    const entryPos = COLOR_ENTRY[color];
    const captures = findCaptures(state, color, entryPos, "track");
    // Check if own token occupies entry
    if (isOwnTokenAt(state, color, entryPos, "track")) return null;
    return {
      tokenId: token.id,
      fromStatus: "base",
      fromPos: -1,
      toStatus: "track",
      toPos: entryPos,
      captures,
    };
  }

  // Token on track
  if (token.status === "track") {
    const relPos = absoluteToRelative(color, token.trackPos);
    const newRelPos = relPos + dice;
    const homeLaneEntryRel = absoluteToRelative(color, HOME_LANE_ENTRY[color]);

    // Check if token should enter home lane
    if (relPos <= homeLaneEntryRel && newRelPos > homeLaneEntryRel) {
      const homeLanePos = newRelPos - homeLaneEntryRel - 1;
      if (homeLanePos >= HOME_LANE_LENGTH) return null; // Overshot
      const toStatus: TokenStatus = homeLanePos === HOME_LANE_LENGTH - 1 ? "finished" : "home_lane";
      return {
        tokenId: token.id,
        fromStatus: "track",
        fromPos: token.trackPos,
        toStatus,
        toPos: homeLanePos,
        captures: [],
      };
    }

    // Normal track movement
    const newAbsPos = (token.trackPos + dice) % TOTAL_TRACK_SQUARES;
    // Check if own token occupies destination
    if (isOwnTokenAt(state, color, newAbsPos, "track")) return null;
    const captures = findCaptures(state, color, newAbsPos, "track");
    return {
      tokenId: token.id,
      fromStatus: "track",
      fromPos: token.trackPos,
      toStatus: "track",
      toPos: newAbsPos,
      captures,
    };
  }

  // Token in home lane
  if (token.status === "home_lane") {
    const newPos = token.trackPos + dice;
    if (newPos >= HOME_LANE_LENGTH) return null; // Overshot
    const toStatus: TokenStatus = newPos === HOME_LANE_LENGTH - 1 ? "finished" : "home_lane";
    // Check if own token occupies home lane destination
    if (toStatus === "home_lane" && isOwnTokenInHomeLane(state, color, newPos)) return null;
    return {
      tokenId: token.id,
      fromStatus: "home_lane",
      fromPos: token.trackPos,
      toStatus,
      toPos: newPos,
      captures: [],
    };
  }

  return null;
}

function isOwnTokenAt(
  state: GameState,
  color: PlayerColor,
  trackPos: number,
  status: TokenStatus,
): boolean {
  const player = state.players.find((p) => p.color === color);
  if (!player) return false;
  return player.tokens.some((t) => t.status === status && t.trackPos === trackPos);
}

function isOwnTokenInHomeLane(
  state: GameState,
  color: PlayerColor,
  lanePos: number,
): boolean {
  const player = state.players.find((p) => p.color === color);
  if (!player) return false;
  return player.tokens.some((t) => t.status === "home_lane" && t.trackPos === lanePos);
}

function findCaptures(
  state: GameState,
  movingColor: PlayerColor,
  targetTrackPos: number,
  targetStatus: TokenStatus,
): string[] {
  if (targetStatus !== "track") return [];
  // Cannot capture on safe squares
  if (SAFE_SQUARES.has(targetTrackPos)) return [];

  const captured: string[] = [];
  for (const player of state.players) {
    if (player.color === movingColor) continue;
    for (const token of player.tokens) {
      if (token.status === "track" && token.trackPos === targetTrackPos) {
        captured.push(token.id);
      }
    }
  }
  return captured;
}

// ---------------------------------------------------------------------------
// Move application
// ---------------------------------------------------------------------------

export function canMove(state: GameState, playerId: string, tokenId: string): boolean {
  if (state.phase !== "playing") return false;
  const active = getActivePlayer(state);
  if (active.id !== playerId) return false;
  if (state.dice.used) return false;
  return state.legalMoves.some((m) => m.tokenId === tokenId);
}

export function applyMove(state: GameState, tokenId: string): GameState {
  const move = state.legalMoves.find((m) => m.tokenId === tokenId);
  if (!move) return state;

  const next = cloneState(state);
  const player = getActivePlayer(next);
  const token = player.tokens.find((t) => t.id === tokenId);
  if (!token) return state;

  // Apply the move
  token.status = move.toStatus;
  token.trackPos = move.toPos;

  // Apply captures: send captured tokens back to base
  for (const captureId of move.captures) {
    for (const p of next.players) {
      const capturedToken = p.tokens.find((t) => t.id === captureId);
      if (capturedToken) {
        capturedToken.status = "base";
        capturedToken.trackPos = -1;
      }
    }
  }

  // Mark dice as used
  next.dice.used = true;
  next.legalMoves = [];
  next.actionSeq += 1;

  // Check for win
  const winResult = checkWin(next);
  if (winResult) {
    next.phase = "finished";
    next.winner = winResult;
    return next;
  }

  // Determine if player gets another turn
  const extraTurn = next.dice.value === 6 || (next.config.captureBonus && move.captures.length > 0);

  // Handle three consecutive sixes rule
  if (next.dice.value === 6 && next.dice.rollCount >= 3 && next.dice.rollCount % 3 === 0) {
    if (next.config.threeConsecSixes === "skip") {
      // Skip the extra turn, advance to next player
      return advanceTurn(next);
    }
    // "nullify" would undo the last three moves - simplified: just skip turn
    return advanceTurn(next);
  }

  if (extraTurn) {
    // Player rolls again - reset dice for next roll but keep rollCount
    next.dice = {
      value: null,
      rolledAt: null,
      rollCount: next.dice.rollCount,
      used: true,
    };
    return next;
  }

  return advanceTurn(next);
}

// ---------------------------------------------------------------------------
// Turn management
// ---------------------------------------------------------------------------

export function advanceTurn(state: GameState): GameState {
  const next = cloneState(state);
  const playerCount = next.players.length;
  next.activePlayerIndex = (next.activePlayerIndex + 1) % playerCount;
  next.turnNumber += 1;
  next.dice = { value: null, rolledAt: null, rollCount: 0, used: true };
  next.legalMoves = [];
  next.actionSeq += 1;
  return next;
}

// ---------------------------------------------------------------------------
// Win detection
// ---------------------------------------------------------------------------

export function checkWin(state: GameState): PlayerColor | null {
  for (const player of state.players) {
    const allFinished = player.tokens.every((t) => t.status === "finished");
    if (allFinished) return player.color;
  }
  return null;
}
