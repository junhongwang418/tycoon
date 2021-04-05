import * as PIXI from "pixi.js";
import Color from "./Color";

export enum Suit {
  Spade = "♠️",
  Heart = "❤️",
  Diamond = "♦️",
  Club = "♣️",
}

export enum Value {
  Two = "2",
  Three = "3",
  Four = "4",
  Five = "5",
  Six = "6",
  Seven = "7",
  Eight = "8",
  Nine = "9",
  Ten = "10",
  Jack = "J",
  Queen = "Q",
  King = "K",
  Ace = "A",
}

class Card extends PIXI.Container {
  private static readonly WIDTH_MILLIMETER = 64;
  private static readonly HEIGHT_MILLIMETER = 89;
  private static readonly CORNER_RADIUS_MILLIMETER = 3;
  private static readonly BORDER_WIDTH = 1;

  private value: Value;
  private suit: Suit;

  constructor(value: Value, suit: Suit) {
    super();
    this.draw(value, suit);
    this.x = Math.random() * 800;
    this.y = Math.random() * 600;
  }

  private createFrame(): PIXI.Graphics {
    const frame = new PIXI.Graphics();
    frame.lineStyle(Card.BORDER_WIDTH, Color.BLACK);
    frame.beginFill(Color.WHITE);
    const x = 0;
    const y = 0;
    frame.drawRoundedRect(
      x,
      y,
      Card.WIDTH_MILLIMETER,
      Card.HEIGHT_MILLIMETER,
      Card.CORNER_RADIUS_MILLIMETER
    );
    frame.endFill();
    return frame;
  }

  private createValueGraphics(value: Value): PIXI.Text {
    const vg = new PIXI.Text(value.toString());
    return vg;
  }

  private createSuitGraphics(suit: Suit): PIXI.Text {
    const sg = new PIXI.Text(suit.toString());
    return sg;
  }

  private drawFrame(): void {
    const frame = this.createFrame();
    this.addChild(frame);
  }

  private drawValueGraphics(value: Value): void {
    const vg = this.createValueGraphics(value);
    this.addChild(vg);
  }

  private drawSuitGraphics(suit: Suit): void {
    const sg = this.createSuitGraphics(suit);
    sg.y = 20;
    this.addChild(sg);
  }

  private draw(value: Value, suit: Suit) {
    this.drawFrame();
    this.drawValueGraphics(value);
    this.drawSuitGraphics(suit);
  }
}

export default Card;
