import Card, { CardSuit, CardValue } from "../common/Card";
import Algorithm from "../common/Algorithm";

class CardDeck {
  private static readonly NUM_JOKERS = 2;

  private cards: Card[];

  constructor() {
    this.cards = this.createAllPossibleCards();
  }

  private createAllPossibleCards(): Card[] {
    const cards = [];
    const values = Object.values(CardValue).filter(
      (v) => v !== CardValue.Joker
    );
    const suits = Object.values(CardSuit).filter((s) => s !== CardSuit.Joker);

    values.forEach((value) => {
      suits.forEach((suit) => {
        cards.push(new Card(value, suit));
      });
    });

    for (let i = 0; i < CardDeck.NUM_JOKERS; i++) {
      cards.push(new Card(CardValue.Joker, CardSuit.Joker));
    }

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
