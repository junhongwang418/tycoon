import * as PIXI from "pixi.js";
import { CardJson, CardSuit, CardValue, CardValueUtil } from "../common/Card";
import Color from "./Color";
import Text from "./Text";
import View from "./View";

class Card extends View {
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

    this.frame = this.createFrame();
    this.text = this.createText();

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

  private createText() {
    return new Text(this.toString(), {
      fill: this.toColor(),
      fontSize: Card.FONT_SIZE,
    });
  }

  private createFrame() {
    const frame = new PIXI.Graphics();
    frame.beginFill(Color.Black);
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

  private toString() {
    if (this.value === CardValue.Ace && this.suit === CardSuit.Spade)
      return "🂡";
    if (this.value === CardValue.Two && this.suit === CardSuit.Spade)
      return "🂢";
    if (this.value === CardValue.Three && this.suit === CardSuit.Spade)
      return "🂣";
    if (this.value === CardValue.Four && this.suit === CardSuit.Spade)
      return "🂤";
    if (this.value === CardValue.Five && this.suit === CardSuit.Spade)
      return "🂥";
    if (this.value === CardValue.Six && this.suit === CardSuit.Spade)
      return "🂦";
    if (this.value === CardValue.Seven && this.suit === CardSuit.Spade)
      return "🂧";
    if (this.value === CardValue.Eight && this.suit === CardSuit.Spade)
      return "🂨";
    if (this.value === CardValue.Nine && this.suit === CardSuit.Spade)
      return "🂩";
    if (this.value === CardValue.Ten && this.suit === CardSuit.Spade)
      return "🂪";
    if (this.value === CardValue.Jack && this.suit === CardSuit.Spade)
      return "🂫";
    if (this.value === CardValue.Queen && this.suit === CardSuit.Spade)
      return "🂭";
    if (this.value === CardValue.King && this.suit === CardSuit.Spade)
      return "🂮";

    if (this.value === CardValue.Ace && this.suit === CardSuit.Heart)
      return "🂱";
    if (this.value === CardValue.Two && this.suit === CardSuit.Heart)
      return "🂲";
    if (this.value === CardValue.Three && this.suit === CardSuit.Heart)
      return "🂳";
    if (this.value === CardValue.Four && this.suit === CardSuit.Heart)
      return "🂴";
    if (this.value === CardValue.Five && this.suit === CardSuit.Heart)
      return "🂵";
    if (this.value === CardValue.Six && this.suit === CardSuit.Heart)
      return "🂶";
    if (this.value === CardValue.Seven && this.suit === CardSuit.Heart)
      return "🂷";
    if (this.value === CardValue.Eight && this.suit === CardSuit.Heart)
      return "🂸";
    if (this.value === CardValue.Nine && this.suit === CardSuit.Heart)
      return "🂹";
    if (this.value === CardValue.Ten && this.suit === CardSuit.Heart)
      return "🂺";
    if (this.value === CardValue.Jack && this.suit === CardSuit.Heart)
      return "🂻";
    if (this.value === CardValue.Queen && this.suit === CardSuit.Heart)
      return "🂽";
    if (this.value === CardValue.King && this.suit === CardSuit.Heart)
      return "🂾";

    if (this.value === CardValue.Ace && this.suit === CardSuit.Diamond)
      return "🃁";
    if (this.value === CardValue.Two && this.suit === CardSuit.Diamond)
      return "🃂";
    if (this.value === CardValue.Three && this.suit === CardSuit.Diamond)
      return "🃃";
    if (this.value === CardValue.Four && this.suit === CardSuit.Diamond)
      return "🃄";
    if (this.value === CardValue.Five && this.suit === CardSuit.Diamond)
      return "🃅";
    if (this.value === CardValue.Six && this.suit === CardSuit.Diamond)
      return "🃆";
    if (this.value === CardValue.Seven && this.suit === CardSuit.Diamond)
      return "🃇";
    if (this.value === CardValue.Eight && this.suit === CardSuit.Diamond)
      return "🃈";
    if (this.value === CardValue.Nine && this.suit === CardSuit.Diamond)
      return "🃉";
    if (this.value === CardValue.Ten && this.suit === CardSuit.Diamond)
      return "🃊";
    if (this.value === CardValue.Jack && this.suit === CardSuit.Diamond)
      return "🃋";
    if (this.value === CardValue.Queen && this.suit === CardSuit.Diamond)
      return "🃍";
    if (this.value === CardValue.King && this.suit === CardSuit.Diamond)
      return "🃎";

    if (this.value === CardValue.Ace && this.suit === CardSuit.Club) return "🃑";
    if (this.value === CardValue.Two && this.suit === CardSuit.Club) return "🃒";
    if (this.value === CardValue.Three && this.suit === CardSuit.Club)
      return "🃓";
    if (this.value === CardValue.Four && this.suit === CardSuit.Club)
      return "🃔";
    if (this.value === CardValue.Five && this.suit === CardSuit.Club)
      return "🃕";
    if (this.value === CardValue.Six && this.suit === CardSuit.Club) return "🃖";
    if (this.value === CardValue.Seven && this.suit === CardSuit.Club)
      return "🃗";
    if (this.value === CardValue.Eight && this.suit === CardSuit.Club)
      return "🃘";
    if (this.value === CardValue.Nine && this.suit === CardSuit.Club)
      return "🃙";
    if (this.value === CardValue.Ten && this.suit === CardSuit.Club) return "🃚";
    if (this.value === CardValue.Jack && this.suit === CardSuit.Club)
      return "🃛";
    if (this.value === CardValue.Queen && this.suit === CardSuit.Club)
      return "🃝";
    if (this.value === CardValue.King && this.suit === CardSuit.Club)
      return "🃞";

    if (this.value === CardValue.Joker && this.suit === CardSuit.Joker)
      return "🃟";

    return "🂠";
  }

  private toColor() {
    switch (this.suit) {
      case CardSuit.Spade:
        return Color.Blue;
      case CardSuit.Heart:
        return Color.Red;
      case CardSuit.Diamond:
        return Color.Yellow;
      case CardSuit.Club:
        return Color.Green;
      default:
        return Color.White;
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
