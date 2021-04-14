import { CardSuit, CardValue, CardValueUtil } from "./Card";

export enum TycoonOptionKey {
  Revolution = "revolution",
  EightStop = "eight stop",
  Sequence = "sequence",
  Tight = "tight",
  ThreeSpadesReversal = "three spades reversal",
  ElevenBack = "eleven back",
}

export enum TycoonStateKey {
  Revolution = "revolution",
  ElevenBack = "eleven back",
  Tight = "tight",
  Sequence = "sequence",
  Turn = "turn",
}

export interface TycoonOptions {
  [TycoonOptionKey.Revolution]: boolean;
  [TycoonOptionKey.EightStop]: boolean;
  [TycoonOptionKey.Sequence]: boolean;
  [TycoonOptionKey.Tight]: boolean;
  [TycoonOptionKey.ThreeSpadesReversal]: boolean;
  [TycoonOptionKey.ElevenBack]: boolean;
}

export const DEFAULT_TYCOON_OPTIONS: TycoonOptions = {
  [TycoonOptionKey.Revolution]: false,
  [TycoonOptionKey.EightStop]: false,
  [TycoonOptionKey.Sequence]: false,
  [TycoonOptionKey.Tight]: false,
  [TycoonOptionKey.ThreeSpadesReversal]: false,
  [TycoonOptionKey.ElevenBack]: false,
};

export interface TycoonState {
  [TycoonStateKey.Revolution]: boolean;
  [TycoonStateKey.ElevenBack]: boolean;
  [TycoonStateKey.Sequence]: boolean;
  [TycoonStateKey.Tight]: CardSuit[];
  [TycoonStateKey.Turn]: number;
}

export const DEFAULT_TYCOON_STATE: TycoonState = {
  [TycoonStateKey.Revolution]: false,
  [TycoonStateKey.ElevenBack]: false,
  [TycoonStateKey.Sequence]: null,
  [TycoonStateKey.Tight]: [],
  [TycoonStateKey.Turn]: 0,
};
