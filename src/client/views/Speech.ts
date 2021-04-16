import * as PIXI from "pixi.js";
import Color from "../Color";
import View from "./View";
import Text from "./Text";
import Frame from "./Frame";

class Speech extends View {
  private bubble: Text;
  private tape: Frame;
  private content: Text;

  constructor(text: string, style?: Partial<PIXI.ITextStyle>) {
    super();
    this.bubble = new Text("💬", { fontSize: 128 });
    this.tape = new Frame({
      width: 64,
      height: 16,
      fill: Color.SpeechBubbleBackground,
    });
    this.content = new Text(text, {
      fill: Color.Black,
      ...style,
    });
  }

  public getSize() {
    return this.bubble.getTextSize();
  }

  protected layout() {
    super.layout();
    this.layoutTape();
    this.layoutContent();
  }

  protected draw() {
    super.draw();
    this.addView(this.bubble);
    this.addView(this.tape);
    this.addView(this.content);
  }

  private layoutTape() {
    this.tape.x = (this.bubble.getTextSize().width - 64) / 2;
    this.tape.y = (this.bubble.getTextSize().height - 16) / 2 - 16;
  }

  private layoutContent() {
    this.content.setCenterAsOrigin();
    this.content.x = this.bubble.getTextSize().width / 2;
    this.content.y = this.bubble.getTextSize().height / 2 - 16;
  }
}

export default Speech;
