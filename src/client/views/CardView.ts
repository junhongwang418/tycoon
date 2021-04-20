import * as PIXI from "pixi.js";
import Card, { CardJson, CardSuit, CardValue } from "../../common/Card";
import Color from "../Color";
import Frame from "./Frame";
import Text from "./Text";
import View from "./View";

class CardView extends View {
  private static readonly FONT_SIZE = 128;
  private static readonly WIDTH = 78;
  private static readonly HEIGHT = 103.5;
  private static readonly FRAME_X = 6;
  private static readonly FRAME_Y = 21.5;

  private selected: boolean;
  private frame: Frame;
  private text: Text;

  private handleSelect: (selected: boolean) => void;

  public readonly model: Card;

  constructor(model: Card) {
    super();

    this.model = model;
    this.selected = false;
    this.frame = this.createFrame();
    this.text = this.createText();
  }

  protected layout() {
    super.layout();
    this.layoutFrame();
  }

  protected draw() {
    super.draw();
    this.addView(this.frame);
    this.addView(this.text);
  }

  private createText() {
    return new Text(this.toString(), {
      fill: this.toColor(),
      fontSize: CardView.FONT_SIZE,
    });
  }

  private createFrame() {
    const frame = new Frame({
      width: CardView.WIDTH,
      height: CardView.HEIGHT,
      fill: Color.Black,
    });
    frame.hitArea = new PIXI.Rectangle(0, 0, CardView.WIDTH, CardView.HEIGHT);
    frame.on("pointerdown", this.handleFramePointerDown);
    return frame;
  }

  private handleFramePointerDown = () => {
    this.selected = !this.selected;
    this.handleSelect(this.selected);
  };

  private layoutFrame() {
    this.frame.x = CardView.FRAME_X;
    this.frame.y = CardView.FRAME_Y;
  }

  public onSelect(cb: (selected: boolean) => void) {
    this.handleSelect = cb;
  }

  private toString() {
    const value = this.model.value;
    const suit = this.model.suit;

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

  private toColor() {
    const suit = this.model.suit;
    switch (suit) {
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
    const model = Card.fromJson(json);
    return new CardView(model);
  }

  public isSelected() {
    return this.selected;
  }

  public disableSelection() {
    this.frame.interactive = false;
  }

  public enableSelection() {
    this.frame.interactive = true;
  }

  protected setCenterAsOriginBasedOnCurrentSize() {
    this.pivot.set(
      CardView.FRAME_X + CardView.WIDTH / 2,
      CardView.FRAME_Y + CardView.HEIGHT / 2
    );
  }

  public static comparator(a: CardView, b: CardView) {
    if (a.model.value === b.model.value) return 0;
    if (a.model.greaterThan(b.model)) return 1;
    return -1;
  }
}

export default CardView;
