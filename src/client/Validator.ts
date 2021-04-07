import Card from "./Card";

class Validator {
  private options?: any;

  constructor(options?: any) {
    this.options = options;
  }

  public isTransitionValid(prevCards: Card[], nextCards: Card[]): boolean {
    if (nextCards.length === 0) return false;

    const isNextCardsValid = this.isCardSelectionValid(nextCards);

    if (prevCards.length === 0) return isNextCardsValid;

    const isSameLength = prevCards.length === nextCards.length;

    const isNextGreaterThanPrev = nextCards[0].greaterThan(prevCards[0]);

    return isSameLength && isNextCardsValid && isNextGreaterThanPrev;
  }

  private isCardSelectionValid(cards: Card[]): boolean {
    if (cards.length === 0) return false;
    return cards.every((card) => card.getValue() === cards[0].getValue());
  }
}

export default Validator;
