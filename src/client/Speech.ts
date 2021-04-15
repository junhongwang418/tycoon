import * as PIXI from "pixi.js";
import Color from "./Color";
import Container from "./Container";
import Text from "./Text";

class Speech extends Container {
  private bubble: Text;
  private tape: PIXI.Graphics;
  private content: Text;

  constructor(text: string, style?: Partial<PIXI.ITextStyle>) {
    super();
    this.bubble = new Text("💬", { fontSize: 128 });
    this.tape = this.createTape();
    this.content = new Text(text, style);

    this.layout();
    this.draw();
  }

  private layout() {
    this.layoutTape();
    this.layoutContent();
  }

  private layoutTape() {
    this.tape.x = (this.bubble.width - this.tape.width) / 2;
    this.tape.y = (this.bubble.height - this.tape.height) / 2 - 16;
  }

  private layoutContent() {
    this.content.anchor.set(0.5);
    this.content.x = this.bubble.width / 2;
    this.content.y = this.bubble.height / 2 - 16;
  }

  private draw() {
    this.addChild(this.bubble);
    this.addChild(this.tape);
    this.addChild(this.content);
  }

  private createTape() {
    const frame = new PIXI.Graphics();
    frame.beginFill(Color.WHITE);
    frame.drawRect(0, 0, 64, 16);
    frame.endFill();
    return frame;
  }
}

export default Speech;
