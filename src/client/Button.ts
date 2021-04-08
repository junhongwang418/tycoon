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
    this.frame = new PIXI.Graphics();
    this.enableInteraction();
    this.addEventListeners();
    this.draw();
  }

  private addEventListeners() {
    this.on("pointerover", this.handlePointerOver);
    this.on("pointerout", this.handlePointerOut);
  }

  private handlePointerOver = () => {
    this.frame.tint = Color.BLUE;
  };

  private handlePointerOut = () => {
    this.frame.tint = Color.WHITE;
  };

  private draw() {
    this.drawFrame();
    this.drawText();
  }

  private drawFrame() {
    this.frame.lineStyle(1, Color.BLACK);
    this.frame.beginFill(Color.WHITE);

    const size = this.calculateSize();
    this.frame.drawRect(0, 0, size.width, size.height);

    this.frame.endFill();

    this.addChild(this.frame);
  }

  private calculateSize(): { width: number; height: number } {
    const text = new Text(this.title);
    return {
      width: text.width + Button.PADDING * 2,
      height: text.height + Button.PADDING * 2,
    };
  }

  private drawText() {
    const text = new Text(this.title);
    text.x = Button.PADDING;
    text.y = Button.PADDING;
    this.addChild(text);
  }

  private defineHitArea() {
    const size = this.calculateSize();
    this.hitArea = new PIXI.Rectangle(0, 0, size.width, size.height);
  }

  private enableInteraction() {
    this.defineHitArea();
    this.interactive = true;
  }

  public enable() {
    this.interactive = true;
    this.frame.tint = Color.WHITE;
  }

  public disable() {
    this.interactive = false;
    this.frame.tint = Color.GREY;
  }
}

export default Button;
