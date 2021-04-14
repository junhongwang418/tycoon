import { CardValue, CardValueUtil } from "../common/Card";
import {
  DEFAULT_TYCOON_STATE,
  TycoonOptionKey,
  TycoonOptions,
  TycoonState,
  TycoonStateKey,
} from "../common/Tycoon";
import Card from "./Card";

class Tycoon {
  private myTurn: number;
  private options: TycoonOptions;
  private state: TycoonState;
  private prevCards: Card[];

  constructor(options: TycoonOptions) {
    this.options = options;
    this.state = DEFAULT_TYCOON_STATE;
    this.prevCards = [];
  }

  public init(myTurn: number) {
    this.myTurn = myTurn;
  }

  public play(nextCards: Card[]) {
    if (!this.validateNextCards(nextCards)) return;

    const mostSignificantPrevCard =
      this.prevCards.filter((card) => !card.isJoker())[0] || this.prevCards[0];
    const mostSignificantNextCard =
      nextCards.filter((card) => !card.isJoker())[0] || nextCards[0];

    if (this.options[TycoonOptionKey.EightStop]) {
      if (
        mostSignificantNextCard &&
        mostSignificantNextCard.getValue() === CardValue.Eight
      ) {
        this.prevCards = [];
        this.state[TycoonStateKey.ElevenBack] = false;
        this.state[TycoonStateKey.Tight] = [];
        this.state[TycoonStateKey.Sequence] = false;
        return;
      }
    }

    if (this.options[TycoonOptionKey.ThreeSpadesReversal]) {
      if (
        mostSignificantPrevCard &&
        mostSignificantPrevCard.isJoker() &&
        mostSignificantNextCard.isThreeOfSpades()
      ) {
        this.prevCards = [];
        this.state[TycoonStateKey.ElevenBack] = false;
        this.state[TycoonStateKey.Tight] = [];
        this.state[TycoonStateKey.Sequence] = false;
        return;
      }
    }

    if (this.options[TycoonOptionKey.Revolution]) {
      if (nextCards.length === 4) {
        this.state[TycoonStateKey.Revolution] = !this.state[
          TycoonStateKey.Revolution
        ];
      }
    }

    if (this.options[TycoonOptionKey.ElevenBack]) {
      if (
        mostSignificantNextCard &&
        mostSignificantNextCard.getValue() === CardValue.Jack
      ) {
        this.state[TycoonOptionKey.ElevenBack] = true;
      }
    }

    if (this.options[TycoonOptionKey.Tight]) {
      const nextCardsExists = nextCards.length > 0;
      const prevCardsExists = this.prevCards.length > 0;
      const currentlyNoTight = this.state[TycoonStateKey.Tight].length === 0;
      const noJokersInvolved =
        this.prevCards.every((card) => !card.isJoker()) &&
        nextCards.every((card) => !card.isJoker());
      if (
        nextCardsExists &&
        prevCardsExists &&
        currentlyNoTight &&
        noJokersInvolved
      ) {
        const prevSuits = this.prevCards.map((card) => card.getSuit());
        if (nextCards.every((card) => prevSuits.includes(card.getSuit()))) {
          this.state[TycoonStateKey.Tight] = prevSuits;
        }
      }
    }

    if (this.options[TycoonStateKey.Sequence]) {
      const nextCardsExists = nextCards.length > 0;
      const prevCardsExists = this.prevCards.length > 0;
      const currentlyNoSequence = !this.state[TycoonStateKey.Sequence];
      if (nextCardsExists && prevCardsExists && currentlyNoSequence) {
        const neitherMostSignificantCardIsJoker =
          !mostSignificantPrevCard.isJoker() &&
          !mostSignificantNextCard.isJoker();

        if (neitherMostSignificantCardIsJoker) {
          if (
            Math.abs(
              CardValueUtil.toVirtualNumber(
                mostSignificantNextCard.getValue()
              ) -
                CardValueUtil.toVirtualNumber(
                  mostSignificantPrevCard.getValue()
                )
            ) === 1
          ) {
            this.state[TycoonStateKey.Sequence] = true;
          }
        }
      }
    }

    const isPass = nextCards.length === 0;
    if (isPass) {
      this.state[TycoonStateKey.ElevenBack] = false;
      this.state[TycoonStateKey.Tight] = [];
      this.state[TycoonStateKey.Sequence] = false;
    }

    this.prevCards = nextCards;
    this.state[TycoonStateKey.Turn] = (this.state[TycoonStateKey.Turn] + 1) % 2;
  }

  public validateNextCards(nextCards: Card[]) {
    if (this.state == null || this.prevCards == null)
      throw new Error("not enough info given");

    if (!this.validateCards(nextCards)) return false;

    return this.validateTransition(nextCards);
  }

  private validateTransition(nextCards: Card[]): boolean {
    if (this.prevCards.length === 0 && nextCards.length === 0) return false;
    if (this.prevCards.length === 0 || nextCards.length === 0) return true;

    const isSameLength = this.prevCards.length === nextCards.length;

    const mostSiginificantPrevCard =
      this.prevCards.filter((card) => !card.isJoker())[0] || this.prevCards[0];

    const mostSignificantNextCard =
      nextCards.filter((card) => !card.isJoker())[0] || nextCards[0];

    const isNextGreaterThanPrev = mostSignificantNextCard.greaterThan(
      mostSiginificantPrevCard
    );

    const isNextLessThanPrev = mostSignificantNextCard.lessThan(
      mostSiginificantPrevCard
    );

    let strengthFlipped = false;
    if (this.state[TycoonStateKey.Revolution])
      strengthFlipped = !strengthFlipped;
    if (this.state[TycoonStateKey.ElevenBack])
      strengthFlipped = !strengthFlipped;

    let isNextStrongerThanPrev = strengthFlipped
      ? isNextLessThanPrev
      : isNextGreaterThanPrev;

    if (this.options[TycoonOptionKey.ThreeSpadesReversal]) {
      if (
        mostSiginificantPrevCard.isJoker() &&
        mostSignificantNextCard.isThreeOfSpades()
      ) {
        isNextStrongerThanPrev = true;
      }
    }

    if (this.state[TycoonStateKey.Tight].length > 0) {
      const nextCardsJokersExcluded = nextCards.filter(
        (card) => !card.isJoker()
      );
      if (
        !nextCardsJokersExcluded.every((card) =>
          this.state[TycoonStateKey.Tight].includes(card.getSuit())
        )
      ) {
        return false;
      }
    }

    if (this.state[TycoonStateKey.Sequence]) {
      if (
        Math.abs(
          CardValueUtil.toVirtualNumber(mostSignificantNextCard.getValue()) -
            CardValueUtil.toVirtualNumber(mostSiginificantPrevCard.getValue())
        ) !== 1
      ) {
        return false;
      }
    }

    return isSameLength && isNextStrongerThanPrev;
  }

  private validateCards(cards: Card[]): boolean {
    if (cards.length === 0) return true;
    return cards
      .filter((card) => !card.isJoker())
      .every((card) => card.getValue() === cards[0].getValue());
  }

  public isMyTurn() {
    return this.myTurn === this.state[TycoonStateKey.Turn];
  }

  public getPrevCards() {
    return this.prevCards;
  }
}

export default Tycoon;
