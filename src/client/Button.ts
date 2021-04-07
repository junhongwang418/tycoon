import EventEmitter from "eventemitter3";
import * as PIXI from "pixi.js";
import Color from "./Color";
import Text from "./Text";

class Button extends PIXI.Container {
  private static readonly PADDING = 8;

  private title: string;
  private frame: PIXI.Graphics;

  constructor(title: string) {
    super();
    this.title = title;
    this.enableInteraction();
    this.draw();
    this.addEventListeners();
  }

  private addEventListeners() {
    this.on("pointerover", () => {
      this.frame.tint = 0x1687a7;
    });
    this.on("pointerout", () => {
      this.frame.tint = 0xffffff;
    });
  }

  private draw() {
    this.drawFrame();
    this.drawText();
  }

  private drawFrame() {
    const text = new Text(this.title);
    this.frame = new PIXI.Graphics();
    this.frame.lineStyle(1, Color.BLACK);
    this.frame.beginFill(Color.WHITE);
    this.frame.drawRect(
      0,
      0,
      text.width + Button.PADDING * 2,
      text.height + Button.PADDING * 2
    );
    this.frame.endFill();
    this.addChild(this.frame);
  }

  private drawText() {
    const text = new Text(this.title);
    text.x = Button.PADDING;
    text.y = Button.PADDING;
    this.addChild(text);
  }

  private enableInteraction() {
    const text = new Text(this.title);
    this.hitArea = new PIXI.Rectangle(
      0,
      0,
      text.width + Button.PADDING * 2,
      text.height + Button.PADDING * 2
    );
    this.interactive = true;
  }

  public enable() {
    this.interactive = true;
    this.frame.tint = 0xffffff;
  }

  public disable() {
    this.interactive = false;
    this.frame.tint = 0xaaaaaa;
  }
}

export default Button;
