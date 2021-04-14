import * as PIXI from "pixi.js";
import { CardJson, CardSuit, CardValue, CardValueUtil } from "../common/Card";
import Color from "./Color";
import Text from "./Text";
import Container from "./Container";

class Card extends Container {
  private static readonly FONT_SIZE = 128;
  private static readonly WIDTH = 78;
  private static readonly HEIGHT = 103.5;
  private static readonly FRAME_X = 6;
  private static readonly FRAME_Y = 21.5;

  private value: CardValue;
  private suit: CardSuit;

  private selected: boolean;

  private frame: PIXI.Graphics;
  private text: Text;

  private handleSelect: (selected: boolean) => void;

  constructor(value: CardValue, suit: CardSuit) {
    super();

    this.value = value;
    this.suit = suit;
    this.selected = false;

    this.text = new Text(Card.toText(value, suit), {
      fill: Card.toColor(suit),
      fontSize: Card.FONT_SIZE,
    });
    this.frame = this.createFrame();

    this.layout();
    this.draw();
  }

  private layout() {
    this.layoutFrame();
  }

  private draw() {
    this.addChild(this.frame);
    this.addChild(this.text);
  }

  private createFrame() {
    const frame = new PIXI.Graphics();
    frame.beginFill(Color.BLACK);
    frame.drawRect(0, 0, Card.WIDTH, Card.HEIGHT);
    frame.endFill();
    frame.interactive = true;
    frame.hitArea = new PIXI.Rectangle(0, 0, Card.WIDTH, Card.HEIGHT);
    frame.on("pointerdown", this.handleFramePointerDown);
    return frame;
  }

  private handleFramePointerDown = () => {
    this.selected = !this.selected;
    this.handleSelect(this.selected);
  };

  private layoutFrame() {
    this.frame.x = Card.FRAME_X;
    this.frame.y = Card.FRAME_Y;
  }

  public greaterThan(other: Card): boolean {
    return CardValueUtil.greaterThan(this.value, other.value);
  }

  public lessThan(other: Card): boolean {
    return CardValueUtil.lessThan(this.value, other.value);
  }

  public onSelect(cb: (selected: boolean) => void) {
    this.handleSelect = cb;
  }

  private static toText(value: CardValue, suit: CardSuit) {
    if (value === CardValue.Ace && suit === CardSuit.Spade) return "🂡";
    if (value === CardValue.Two && suit === CardSuit.Spade) return "🂢";
    if (value === CardValue.Three && suit === CardSuit.Spade) return "🂣";
    if (value === CardValue.Four && suit === CardSuit.Spade) return "🂤";
    if (value === CardValue.Five && suit === CardSuit.Spade) return "🂥";
    if (value === CardValue.Six && suit === CardSuit.Spade) return "🂦";
    if (value === CardValue.Seven && suit === CardSuit.Spade) return "🂧";
    if (value === CardValue.Eight && suit === CardSuit.Spade) return "🂨";
    if (value === CardValue.Nine && suit === CardSuit.Spade) return "🂩";
    if (value === CardValue.Ten && suit === CardSuit.Spade) return "🂪";
    if (value === CardValue.Jack && suit === CardSuit.Spade) return "🂫";
    if (value === CardValue.Queen && suit === CardSuit.Spade) return "🂭";
    if (value === CardValue.King && suit === CardSuit.Spade) return "🂮";

    if (value === CardValue.Ace && suit === CardSuit.Heart) return "🂱";
    if (value === CardValue.Two && suit === CardSuit.Heart) return "🂲";
    if (value === CardValue.Three && suit === CardSuit.Heart) return "🂳";
    if (value === CardValue.Four && suit === CardSuit.Heart) return "🂴";
    if (value === CardValue.Five && suit === CardSuit.Heart) return "🂵";
    if (value === CardValue.Six && suit === CardSuit.Heart) return "🂶";
    if (value === CardValue.Seven && suit === CardSuit.Heart) return "🂷";
    if (value === CardValue.Eight && suit === CardSuit.Heart) return "🂸";
    if (value === CardValue.Nine && suit === CardSuit.Heart) return "🂹";
    if (value === CardValue.Ten && suit === CardSuit.Heart) return "🂺";
    if (value === CardValue.Jack && suit === CardSuit.Heart) return "🂻";
    if (value === CardValue.Queen && suit === CardSuit.Heart) return "🂽";
    if (value === CardValue.King && suit === CardSuit.Heart) return "🂾";

    if (value === CardValue.Ace && suit === CardSuit.Diamond) return "🃁";
    if (value === CardValue.Two && suit === CardSuit.Diamond) return "🃂";
    if (value === CardValue.Three && suit === CardSuit.Diamond) return "🃃";
    if (value === CardValue.Four && suit === CardSuit.Diamond) return "🃄";
    if (value === CardValue.Five && suit === CardSuit.Diamond) return "🃅";
    if (value === CardValue.Six && suit === CardSuit.Diamond) return "🃆";
    if (value === CardValue.Seven && suit === CardSuit.Diamond) return "🃇";
    if (value === CardValue.Eight && suit === CardSuit.Diamond) return "🃈";
    if (value === CardValue.Nine && suit === CardSuit.Diamond) return "🃉";
    if (value === CardValue.Ten && suit === CardSuit.Diamond) return "🃊";
    if (value === CardValue.Jack && suit === CardSuit.Diamond) return "🃋";
    if (value === CardValue.Queen && suit === CardSuit.Diamond) return "🃍";
    if (value === CardValue.King && suit === CardSuit.Diamond) return "🃎";

    if (value === CardValue.Ace && suit === CardSuit.Club) return "🃑";
    if (value === CardValue.Two && suit === CardSuit.Club) return "🃒";
    if (value === CardValue.Three && suit === CardSuit.Club) return "🃓";
    if (value === CardValue.Four && suit === CardSuit.Club) return "🃔";
    if (value === CardValue.Five && suit === CardSuit.Club) return "🃕";
    if (value === CardValue.Six && suit === CardSuit.Club) return "🃖";
    if (value === CardValue.Seven && suit === CardSuit.Club) return "🃗";
    if (value === CardValue.Eight && suit === CardSuit.Club) return "🃘";
    if (value === CardValue.Nine && suit === CardSuit.Club) return "🃙";
    if (value === CardValue.Ten && suit === CardSuit.Club) return "🃚";
    if (value === CardValue.Jack && suit === CardSuit.Club) return "🃛";
    if (value === CardValue.Queen && suit === CardSuit.Club) return "🃝";
    if (value === CardValue.King && suit === CardSuit.Club) return "🃞";

    if (value === CardValue.Joker && suit === CardSuit.Joker) return "🃟";

    return "🂠";
  }

  private static toColor(suit: CardSuit) {
    switch (suit) {
      case CardSuit.Spade:
        return Color.BLUE;
      case CardSuit.Heart:
        return Color.RED;
      case CardSuit.Diamond:
        return Color.YELLOW;
      case CardSuit.Club:
        return Color.GREEN;
      default:
        return Color.WHITE;
    }
  }

  public static fromJson(json: CardJson) {
    return new Card(json.value, json.suit);
  }

  public isSelected() {
    return this.selected;
  }

  public toJson(): CardJson {
    return {
      value: this.value,
      suit: this.suit,
    };
  }

  public getValue() {
    return this.value;
  }

  public getSuit() {
    return this.suit;
  }

  public isJoker() {
    return this.suit === CardSuit.Joker && this.value == CardValue.Joker;
  }

  public disableSelection() {
    this.frame.interactive = false;
  }

  public enableSelection() {
    this.frame.interactive = true;
  }

  public isThreeOfSpades() {
    return this.value === CardValue.Three && this.suit === CardSuit.Spade;
  }

  protected setCenterAsOriginBasedOnCurrentSize() {
    this.pivot.set(
      Card.FRAME_X + Card.WIDTH / 2,
      Card.FRAME_Y + Card.HEIGHT / 2
    );
  }
}

export default Card;
