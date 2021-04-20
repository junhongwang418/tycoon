import Card, { CardUtil, CardValue, CardValueUtil } from "../common/Card";
import {
  SocketInitSuccessData,
  TycoonOptionKey,
  TycoonOptions,
  TycoonState,
  TycoonStateKey,
  TycoonUtil,
} from "../common/Tycoon";
import CardView from "./views/CardView";

class Tycoon {
  private myTurn: number;
  private options: TycoonOptions;
  private state: TycoonState;
  private numTheirCards: number;

  private myCards: Card[];
  private playedCards: Card[][];

  constructor(options: TycoonOptions) {
    this.options = options;
    this.state = TycoonUtil.createDefaultTycoonState();
    this.myCards = [];
    this.playedCards = [];
  }

  public getMyCards() {
    return this.myCards;
  }

  public getNumTheirCards() {
    return this.numTheirCards;
  }

  public init(data: SocketInitSuccessData) {
    const { myTurn, cardJsons } = data;
    this.myTurn = myTurn;
    this.myCards = cardJsons.map((json) => Card.fromJson(json));
    this.numTheirCards = cardJsons.length;
  }

  public getPrevCards() {
    if (this.playedCards.length === 0) return [];
    return this.playedCards[this.playedCards.length - 1];
  }

  public play(nextCards: Card[]) {
    if (!this.validateNextCards(nextCards)) return;

    if (this.isMyTurn()) {
      this.myCards = this.myCards.filter((card) => !nextCards.includes(card));
    } else {
      this.numTheirCards -= nextCards.length;
    }

    const isPass = nextCards.length === 0;
    if (isPass) {
      this.pass();
    } else {
      this.maybeRevolution(nextCards);
      this.maybeTight(nextCards);
      this.maybeSequence(nextCards);
      this.maybeElevenBack(nextCards);
      if (this.maybeEightStop(nextCards)) return;
      if (this.maybeThreeSpadesReversal(nextCards)) return;
      this.playedCards.push(nextCards);
    }

    this.state[TycoonStateKey.Turn] = (this.state[TycoonStateKey.Turn] + 1) % 2;
  }

  private maybeThreeSpadesReversal(nextCards: Card[]) {
    if (!this.options[TycoonOptionKey.ThreeSpadesReversal]) return false;
    if (!this.checkThreeSpadesReversal(nextCards)) return false;
    this.pass();
    return true;
  }

  private maybeEightStop(nextCards: Card[]) {
    if (!this.options[TycoonOptionKey.EightStop]) return false;
    if (!this.checkEightStop(nextCards)) return false;
    this.pass();
    return true;
  }

  private maybeSequence(nextCards: Card[]) {
    if (!this.options[TycoonOptionKey.Sequence]) return;
    if (!this.checkSequence(nextCards)) return;
    this.sequence();
  }

  private maybeRevolution(nextCards: Card[]) {
    if (!this.options[TycoonOptionKey.Revolution]) return;
    if (!this.checkRevolution(nextCards)) return;
    this.revolution();
  }

  private maybeTight(nextCards: Card[]) {
    if (!this.options[TycoonOptionKey.Tight]) return;
    if (!this.checkTight(nextCards)) return;
    this.tight();
  }

  private pass() {
    this.playedCards = [];
    this.state[TycoonStateKey.ElevenBack] = false;
    this.state[TycoonStateKey.Tight] = [];
    this.state[TycoonStateKey.Sequence] = false;
  }

  private checkThreeSpadesReversal(nextCards: Card[]) {
    if (this.getPrevCards().length === 0) return false;
    if (nextCards.length === 0) return false;

    const mostSignificantNextCard = CardUtil.getMostSignificantCard(nextCards);
    const mostSignificantPrevCard = CardUtil.getMostSignificantCard(
      this.getPrevCards()
    );

    return (
      mostSignificantPrevCard.isJoker() &&
      mostSignificantNextCard.isThreeOfSpades()
    );
  }

  private checkEightStop(nextCards: Card[]) {
    if (nextCards.length === 0) return false;
    return (
      this.validateNextCards(nextCards) &&
      nextCards[0].value === CardValue.Eight
    );
  }

  private checkSequence(nextCards: Card[]) {
    if (nextCards.length === 0) return false;
    if (this.getPrevCards().length === 0) return false;
    if (this.state[TycoonStateKey.Sequence]) return false;

    const mostSignificantPrevCard = CardUtil.getMostSignificantCard(
      this.getPrevCards()
    );
    const mostSignificantNextCard = CardUtil.getMostSignificantCard(nextCards);

    if (mostSignificantPrevCard || mostSignificantNextCard) return false;

    const mostSignificantNextCardVirtualNumber = CardValueUtil.toVirtualNumber(
      mostSignificantNextCard.value
    );

    const mostSiginificantPrevCardVirtualNumber = CardValueUtil.toVirtualNumber(
      mostSignificantPrevCard.value
    );

    const diffVirtualNumber =
      mostSignificantNextCardVirtualNumber -
      mostSiginificantPrevCardVirtualNumber;

    return Math.abs(diffVirtualNumber) === 1;
  }

  private sequence() {
    this.state[TycoonStateKey.Sequence] = true;
  }

  private checkTight(nextCards: Card[]) {
    if (nextCards.length === 0) return false;
    if (this.getPrevCards().length === 0) return false;
    if (this.state[TycoonStateKey.Tight].length > 0) return false;

    const prevCardsContainJokers = this.getPrevCards().some((c) => c.isJoker());
    const nextCardsContainJokers = nextCards.some((c) => c.isJoker());

    if (prevCardsContainJokers || nextCardsContainJokers) return false;

    const prevSuits = this.getPrevCards().map((card) => card.suit);

    return nextCards.every((card) => prevSuits.includes(card.suit));
  }

  private tight() {
    const prevSuits = this.getPrevCards().map((card) => card.suit);
    this.state[TycoonStateKey.Tight] = prevSuits;
  }

  private maybeElevenBack(nextCards: Card[]) {
    if (!this.options[TycoonOptionKey.ElevenBack]) return;
    if (!this.checkElevenBack(nextCards)) return;
    this.elevenBack();
  }

  private checkElevenBack(nextCards: Card[]) {
    if (nextCards.length === 0) return false;
    const mostSignificantCard = CardUtil.getMostSignificantCard(nextCards);
    return mostSignificantCard.value === CardValue.Jack;
  }

  private elevenBack() {
    this.state[TycoonOptionKey.ElevenBack] = true;
  }

  private checkRevolution(nextCards: Card[]) {
    return this.validateCards(nextCards) && nextCards.length === 4;
  }

  private revolution() {
    this.state[TycoonStateKey.Revolution] = !this.state[
      TycoonStateKey.Revolution
    ];
  }

  public validateNextCards(nextCards: Card[]) {
    if (!this.validateCards(nextCards)) return false;
    return this.validateTransition(nextCards);
  }

  private validateTransition(nextCards: Card[]): boolean {
    if (this.getPrevCards().length === 0 && nextCards.length === 0)
      return false;
    if (this.getPrevCards().length === 0 || nextCards.length === 0) return true;
    if (this.getPrevCards().length !== nextCards.length) return false;
    if (!this.validateTight(nextCards)) return false;
    if (!this.validateSequence(nextCards)) return false;

    return this.isNextStrongerThanPrev(nextCards);
  }

  private isNextStrongerThanPrev(nextCards: Card[]) {
    const mostSiginificantPrevCard = CardUtil.getMostSignificantCard(
      this.getPrevCards()
    );

    const mostSignificantNextCard = CardUtil.getMostSignificantCard(nextCards);

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

    return isNextStrongerThanPrev;
  }

  private validateTight(nextCards: Card[]) {
    if (this.state[TycoonStateKey.Tight].length > 0) {
      const nextCardsJokersExcluded = nextCards.filter(
        (card) => !card.isJoker()
      );
      if (
        !nextCardsJokersExcluded.every((card) =>
          this.state[TycoonStateKey.Tight].includes(card.suit)
        )
      ) {
        return false;
      }
    }

    return true;
  }

  private validateSequence(nextCards: Card[]) {
    const mostSiginificantPrevCard = CardUtil.getMostSignificantCard(
      this.getPrevCards()
    );

    const mostSignificantNextCard = CardUtil.getMostSignificantCard(nextCards);

    if (this.state[TycoonStateKey.Sequence]) {
      if (
        Math.abs(
          CardValueUtil.toVirtualNumber(mostSignificantNextCard.value) -
            CardValueUtil.toVirtualNumber(mostSiginificantPrevCard.value)
        ) !== 1
      ) {
        return false;
      }
    }

    return true;
  }

  private validateCards(cards: Card[]): boolean {
    if (cards.length === 0) return true;
    return cards
      .filter((card) => !card.isJoker())
      .every((card) => card.value === cards[0].value);
  }

  public isMyTurn() {
    return this.myTurn === this.state[TycoonStateKey.Turn];
  }
}

export default Tycoon;
