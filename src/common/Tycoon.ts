import Card, {
  CardJson,
  CardSuit,
  CardUtil,
  CardValue,
  CardValueUtil,
} from "./Card";

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

export interface TycoonState {
  [TycoonStateKey.Revolution]: boolean;
  [TycoonStateKey.ElevenBack]: boolean;
  [TycoonStateKey.Sequence]: boolean;
  [TycoonStateKey.Tight]: CardSuit[];
  [TycoonStateKey.Turn]: number;
}

export interface SocketInitSuccessData {
  cardJsons: CardJson[];
  myTurn: number;
  numPlayers: number;
}

export class TycoonUtil {
  public static createDefaultTycoonState(): TycoonState {
    return {
      [TycoonStateKey.Revolution]: false,
      [TycoonStateKey.ElevenBack]: false,
      [TycoonStateKey.Sequence]: null,
      [TycoonStateKey.Tight]: [],
      [TycoonStateKey.Turn]: 0,
    };
  }

  public static createDefaultTycoonOptions(): TycoonOptions {
    return {
      [TycoonOptionKey.Revolution]: false,
      [TycoonOptionKey.EightStop]: false,
      [TycoonOptionKey.Sequence]: false,
      [TycoonOptionKey.Tight]: false,
      [TycoonOptionKey.ThreeSpadesReversal]: false,
      [TycoonOptionKey.ElevenBack]: false,
    };
  }
}

class Tycoon {
  private numPlayers: number;
  private myTurn: number;
  private options: TycoonOptions;
  private state: TycoonState;
  private numTheirCards: {
    [turn: number]: number;
  };
  private passes: {
    [turn: number]: boolean;
  };

  private myCards: Card[];
  private playedCards: Card[][];
  private prevCardsTurnNumber: number;

  private prevTurn: number;

  constructor(numPlayers: number, options: TycoonOptions) {
    this.numPlayers = numPlayers;
    this.options = options;
    this.state = TycoonUtil.createDefaultTycoonState();
    this.myCards = [];
    this.playedCards = [];
    this.numTheirCards = {};
    this.prevCardsTurnNumber = null;
    this.passes = {};
    this.prevTurn = null;
  }

  private resetPasses() {
    Object.keys(this.passes).forEach((key) => {
      this.passes[key] = false;
    });
  }

  public isGameOver() {
    return (
      [...Object.values(this.numTheirCards), this.myCards.length].filter(
        (len) => len === 0
      ).length ===
      this.numPlayers - 1
    );
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

    for (let i = 0; i < this.numPlayers; i++) {
      if (i !== myTurn) {
        this.numTheirCards[i] = cardJsons.length;
      }
      this.passes[i] = false;
    }
  }

  public getPrevCards() {
    if (this.playedCards.length === 0) return [];
    return this.playedCards[this.playedCards.length - 1];
  }

  public getPlayedCards() {
    return this.playedCards;
  }

  public isEveryoneElsePass() {
    const turnNumbers = Object.keys(this.numTheirCards).filter(
      (key) =>
        this.numTheirCards[key] !== 0 &&
        key !== this.prevCardsTurnNumber.toString()
    );
    if (this.myCards.length !== 0 && this.myTurn !== this.prevCardsTurnNumber) {
      turnNumbers.push(this.myTurn.toString());
    }
    return turnNumbers.every((turn) => this.passes[turn]);
  }

  public play(nextCards: Card[]) {
    if (!this.validateNextCards(nextCards)) return;

    this.prevTurn = this.state[TycoonStateKey.Turn];

    if (this.isMyTurn()) {
      this.myCards = this.myCards.filter((card) => !nextCards.includes(card));
    } else {
      const turn = this.state[TycoonStateKey.Turn];
      this.numTheirCards[turn] -= nextCards.length;
    }

    const isPass = nextCards.length === 0;
    if (isPass) {
      this.passes[this.state[TycoonStateKey.Turn]] = true;
      if (this.isEveryoneElsePass()) this.pass();
    } else {
      this.resetPasses();
      this.prevCardsTurnNumber = null;

      this.maybeRevolution(nextCards);
      this.maybeTight(nextCards);
      this.maybeSequence(nextCards);
      this.maybeElevenBack(nextCards);

      if (this.maybeEightStop(nextCards)) return;
      if (this.maybeThreeSpadesReversal(nextCards)) return;

      this.playedCards.push(nextCards);
      this.prevCardsTurnNumber = this.state[TycoonStateKey.Turn];
    }

    this.state[TycoonStateKey.Turn] = this.getNextTurn();
  }

  private isTurnDone(turn: number): boolean {
    if (turn === this.myTurn) {
      return this.myCards.length === 0;
    } else {
      return this.numTheirCards[turn] === 0;
    }
  }

  private getNextTurn() {
    let turn = this.state[TycoonStateKey.Turn];
    do {
      turn += 1;
      turn = turn % this.numPlayers;
    } while (this.isTurnDone(turn));
    return turn;
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
    this.prevCardsTurnNumber = null;
    this.resetPasses();
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

  public getMyTurn() {
    return this.myTurn;
  }

  public getNumPlayers() {
    return this.numPlayers;
  }

  public getCurrentTurn() {
    return this.state[TycoonStateKey.Turn];
  }

  public getPrevTurn() {
    return this.prevTurn;
  }
}

export default Tycoon;
