import { TycoonOptions } from "../common/Tycoon";
import Card from "./Card";

class Validator {
  private options: TycoonOptions;

  constructor(options: TycoonOptions) {
    this.options = options;
  }

  public isTransitionValid(prevCards: Card[], nextCards: Card[]): boolean {
    if (prevCards.length === 0 && nextCards.length === 0) return false;

    if (nextCards.length === 0) return true;

    const isNextCardsValid = this.isCardSelectionValid(nextCards);

    if (prevCards.length === 0) return isNextCardsValid;

    const isSameLength = prevCards.length === nextCards.length;

    const mostSiginicantPrevCard =
      prevCards.filter((card) => !card.isJoker())[0] || prevCards[0];

    const isNextGreaterThanPrev = nextCards[0].greaterThan(
      mostSiginicantPrevCard
    );

    return isSameLength && isNextCardsValid && isNextGreaterThanPrev;
  }

  private isCardSelectionValid(cards: Card[]): boolean {
    if (cards.length === 0) return true;
    return cards
      .filter((card) => !card.isJoker())
      .every((card) => card.getValue() === cards[0].getValue());
  }
}

export default Validator;
