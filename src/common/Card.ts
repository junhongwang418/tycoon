export enum CardSuit {
  Spade = "Spade",
  Heart = "Heart",
  Diamond = "Diamond",
  Club = "Club",
  Joker = "",
}

export enum CardValue {
  Two = "2",
  Three = "3",
  Four = "4",
  Five = "5",
  Six = "6",
  Seven = "7",
  Eight = "8",
  Nine = "9",
  Ten = "10",
  Jack = "J",
  Queen = "Q",
  King = "K",
  Ace = "A",
  Joker = "",
}

export interface CardJson {
  value: CardValue;
  suit: CardSuit;
}

export class CardValueUtil {
  public static greaterThan(a: CardValue, b: CardValue): boolean {
    if (a === CardValue.Joker && b === CardValue.Joker) return false;
    if (a === CardValue.Joker) return true;
    if (b === CardValue.Joker) return false;

    const aNumber = CardValueUtil.toVirtualNumber(a);
    const bNumber = CardValueUtil.toVirtualNumber(b);

    return aNumber > bNumber;
  }
  public static lessThan(a: CardValue, b: CardValue): boolean {
    if (a === CardValue.Joker && b === CardValue.Joker) return false;
    if (a === CardValue.Joker) return true;
    if (b === CardValue.Joker) return false;

    const aNumber = CardValueUtil.toVirtualNumber(a);
    const bNumber = CardValueUtil.toVirtualNumber(b);

    return aNumber < bNumber;
  }

  public static toVirtualNumber(cardValue: CardValue) {
    if (cardValue === CardValue.Ace) return 14;
    if (cardValue === CardValue.Two) return 15;
    return CardValueUtil.toNumber(cardValue);
  }

  private static toNumber(cardValue: CardValue) {
    switch (cardValue) {
      case CardValue.Ace:
        return 1;
      case CardValue.Two:
        return 2;
      case CardValue.Three:
        return 3;
      case CardValue.Four:
        return 4;
      case CardValue.Five:
        return 5;
      case CardValue.Six:
        return 6;
      case CardValue.Seven:
        return 7;
      case CardValue.Eight:
        return 8;
      case CardValue.Nine:
        return 9;
      case CardValue.Ten:
        return 10;
      case CardValue.Jack:
        return 11;
      case CardValue.Queen:
        return 12;
      case CardValue.King:
        return 13;
      default:
        return null;
    }
  }
}

export class CardUtil {
  public static getMostSignificantCard(cards: Card[]) {
    const nonJokerCards = cards.filter((card) => !card.isJoker());
    return nonJokerCards.length > 0 ? nonJokerCards[0] : cards[0];
  }
}

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

  public greaterThan(other: Card): boolean {
    return CardValueUtil.greaterThan(this.value, other.value);
  }

  public lessThan(other: Card): boolean {
    return CardValueUtil.lessThan(this.value, other.value);
  }

  public equals(other: Card): boolean {
    return this.value === other.value && this.suit === other.suit;
  }

  public static fromJson(json: CardJson) {
    return new Card(json.value, json.suit);
  }

  public isThreeOfSpades() {
    return this.is(CardValue.Three, CardSuit.Spade);
  }

  public isJoker() {
    return this.is(CardValue.Joker, CardSuit.Joker);
  }

  private is(value: CardValue, suit: CardSuit) {
    return this.value === value && this.suit === suit;
  }
}

export default Card;
