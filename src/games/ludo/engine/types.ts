export type PlayerColor = "red" | "green" | "yellow" | "blue";
export type TokenStatus = "base" | "track" | "home_lane" | "finished";
export type GamePhase = "waiting" | "starting" | "playing" | "finished";

export interface Token {
  id: string;
  color: PlayerColor;
  index: number;
  status: TokenStatus;
  trackPos: number;
}

export interface Player {
  id: string;
  color: PlayerColor;
  seatIndex: number;
  name: string;
  connected: boolean;
  tokens: Token[];
}

export interface DiceState {
  value: number | null;
  rolledAt: number | null;
  rollCount: number;
  used: boolean;
}

export interface LegalMove {
  tokenId: string;
  fromStatus: TokenStatus;
  fromPos: number;
  toStatus: TokenStatus;
  toPos: number;
  captures: string[];
}

export interface GameState {
  roomId: string;
  phase: GamePhase;
  players: Player[];
  activePlayerIndex: number;
  dice: DiceState;
  legalMoves: LegalMove[];
  turnNumber: number;
  winner: PlayerColor | null;
  config: RoomConfig;
  actionSeq: number;
}

export interface RoomConfig {
  playerCount: 2 | 3 | 4;
  blockRule: boolean;
  captureBonus: boolean;
  threeConsecSixes: "skip" | "nullify";
}
