import { TycoonOptions } from "./Tycoon";

export interface RoomJson {
  id: string;
  numPlayers: number;
  capacity: number;
  options: TycoonOptions;
}
