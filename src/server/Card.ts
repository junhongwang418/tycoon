import { CardValue, CardSuit, CardJson } from "../Common/Card";

class Card {
  public readonly value: CardValue;
  public readonly suit: CardSuit;

  constructor(value: CardValue, suit: CardSuit) {
    this.value = value;
    this.suit = suit;
  }

  public toJson(): CardJson {
    return {
      value: this.value,
      suit: this.suit,
    };
  }

  public static fromJson(json: CardJson) {
    return new Card(json.value, json.suit);
  }
}

export default Card;
