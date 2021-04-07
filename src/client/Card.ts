import * as PIXI from "pixi.js";
import { CardJson, CardSuit, CardValue, CardValueUtil } from "../common/Card";
import Color from "./Color";

class Card extends PIXI.Container {
  private static readonly WIDTH_MILLIMETER = 128;
  private static readonly HEIGHT_MILLIMETER = 178;
  private static readonly CORNER_RADIUS_MILLIMETER = 6;
  private static readonly BORDER_WIDTH = 2;
  private static readonly SELECTED_OFFSET_Y = 20;

  private value: CardValue;
  private suit: CardSuit;

  private selected: boolean;

  constructor(value: CardValue, suit: CardSuit) {
    super();
    this.value = value;
    this.suit = suit;
    this.selected = false;
    this.enableEventListeners();
    this.addEventListeners();
    this.draw();
  }

  public static comparator(a: Card, b: Card): number {
    const aCardValueNumber = CardValueUtil.toNumber(a.value);
    const bCardValueNumber = CardValueUtil.toNumber(b.value);
    if (aCardValueNumber > bCardValueNumber) return 1;
    if (aCardValueNumber < bCardValueNumber) return -1;
    return a.suit.localeCompare(b.suit);
  }

  private defineHitArea(): void {
    this.hitArea = new PIXI.Rectangle(
      0,
      0,
      Card.WIDTH_MILLIMETER,
      Card.HEIGHT_MILLIMETER
    );
  }

  private enableEventListeners(): void {
    this.defineHitArea();
    this.interactive = true;
  }

  private addEventListeners(): void {
    this.on("click", () => this.select());
  }

  private select() {
    this.y += Card.SELECTED_OFFSET_Y * (this.selected ? 1 : -1);
    this.selected = !this.selected;
  }

  private createFrame(): PIXI.Graphics {
    const frame = new PIXI.Graphics();
    frame.lineStyle(Card.BORDER_WIDTH, Color.BLACK);
    frame.beginFill(Color.WHITE);
    frame.drawRoundedRect(
      0,
      0,
      Card.WIDTH_MILLIMETER,
      Card.HEIGHT_MILLIMETER,
      Card.CORNER_RADIUS_MILLIMETER
    );
    frame.endFill();
    return frame;
  }

  private createValueGraphics(value: CardValue): PIXI.Text {
    const vg = new PIXI.Text(value.toString());
    return vg;
  }

  private createSuitGraphics(suit: CardSuit): PIXI.Text {
    const sg = new PIXI.Text(suit.toString());
    return sg;
  }

  private drawFrame(): void {
    const frame = this.createFrame();
    this.addChild(frame);
  }

  private drawValueGraphics(): void {
    const vg = this.createValueGraphics(this.value);
    this.addChild(vg);
  }

  private drawSuitGraphics(): void {
    const sg = this.createSuitGraphics(this.suit);
    sg.y = 20;
    this.addChild(sg);
  }

  private draw() {
    this.drawFrame();
    this.drawValueGraphics();
    this.drawSuitGraphics();
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
}

export default Card;
