import { TycoonOptions } from "./Tycoon";

export interface RoomJson {
  id: string;
  numPlayers: number;
  capacity: number;
  options: TycoonOptions;
}

export const DEFAULT_ROOM_CAPACITY = 2;
