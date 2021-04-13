import { TycoonOptions } from "./Tycoon";

export interface RoomJson {
  id: string;
  numSockets: number;
  capacity: number;
  options: TycoonOptions;
}
