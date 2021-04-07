import * as PIXI from "pixi.js";
import Color from "./Color";

class Button extends PIXI.Container {
  private title: string;

  constructor(title: string) {
    super();
    this.title = title;
    this.enableInteraction();
    this.draw();
  }

  private draw() {
    this.drawFrame();
    this.drawText();
  }

  private drawFrame() {
    const text = new PIXI.Text(this.title);
    const frame = new PIXI.Graphics();
    frame.lineStyle(1, Color.BLACK);
    frame.beginFill(Color.WHITE);
    frame.drawRect(0, 0, text.width, text.height);
    frame.endFill();
    this.addChild(frame);
  }

  private drawText() {
    const text = new PIXI.Text(this.title);
    this.addChild(text);
  }

  private enableInteraction() {
    const text = new PIXI.Text(this.title);
    this.hitArea = new PIXI.Rectangle(0, 0, text.width, text.height);
    this.interactive = true;
  }
}

export default Button;
