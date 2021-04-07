import { CardSuit, CardValue } from "../common/Card";
import Card from "./Card";
import Algorithm from "../common/Algorithm";

class CardDeck {
  private cards: Card[];

  constructor() {
    this.cards = this.createAllPossibleCards();
  }

  private createAllPossibleCards(): Card[] {
    const cards = [];
    const allCardValues = Object.values(CardValue);
    const allCardSuits = Object.values(CardSuit);

    allCardValues.forEach((value) => {
      allCardSuits.forEach((suit) => {
        cards.push(new Card(value, suit));
      });
    });

    return cards;
  }

  public shuffle(): void {
    Algorithm.shuffle(this.cards);
  }

  public drawMany(count: number): Card[] {
    return this.cards.splice(this.cards.length - count);
  }
}

export default CardDeck;
