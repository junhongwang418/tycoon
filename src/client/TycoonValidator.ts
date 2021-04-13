import { TycoonOptions, TycoonState } from "../Common/Tycoon";
import Card from "./Card";

class TycoonValidator {
  private options: TycoonOptions;
  private state: TycoonState;
  private prevCards: Card[];

  constructor(options: TycoonOptions) {
    this.options = options;
  }

  public withState(state: TycoonState) {
    this.state = state;
    return this;
  }

  public withPrevCards(prevCards: Card[]) {
    this.prevCards = prevCards;
    return this;
  }

  public validateNextCards(nextCards: Card[]) {
    if (this.state == null || this.prevCards == null)
      throw new Error("not enough info given");

    if (!this.validateCards(nextCards)) return false;

    return this.validateTransition(nextCards);
  }

  public validateTransition(nextCards: Card[]): boolean {
    if (this.prevCards.length === 0 || nextCards.length === 0) return true;

    const isSameLength = this.prevCards.length === nextCards.length;

    const mostSiginificantPrevCard =
      this.prevCards.filter((card) => !card.isJoker())[0] || this.prevCards[0];

    const mostSignificantNextCard =
      nextCards.filter((card) => !card.isJoker())[0] || nextCards[0];

    const isNextGreaterThanPrev = mostSignificantNextCard.greaterThan(
      mostSiginificantPrevCard
    );

    return isSameLength && isNextGreaterThanPrev;
  }

  private validateCards(cards: Card[]): boolean {
    if (cards.length === 0) return true;
    return cards
      .filter((card) => !card.isJoker())
      .every((card) => card.getValue() === cards[0].getValue());
  }
}

export default TycoonValidator;
