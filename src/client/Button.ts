import * as PIXI from "pixi.js";
import Color from "./Color";
import View from "./View";
import Sound from "./Sound";
import Text from "./Text";

interface Size {
  width: number;
  height: number;
}

class Button extends View {
  private static readonly PADDING = 8;

  private text: Text;
  private frame: PIXI.Graphics;

  private handlePointerDown = () => {};

  constructor(text: string) {
    super();
    this.text = new Text(text);
    this.frame = this.createFrame();
    this.enableInteraction();
    this.addEventListeners();
    this.layout();
    this.draw();
  }

  private layout() {
    this.layoutText();
  }

  private draw() {
    this.addChild(this.frame);
    this.addChild(this.text);
  }

  private createFrame() {
    const size = this.calculateFrameSize();
    const frame = new PIXI.Graphics();
    frame.lineStyle(1, Color.White);
    frame.beginFill(Color.Black);
    frame.drawRect(0, 0, size.width, size.height);
    frame.endFill();
    return frame;
  }

  private layoutText() {
    this.text.x = Button.PADDING;
    this.text.y = Button.PADDING;
  }

  private addEventListeners() {
    this.on("pointerover", this.handlePointerOver);
    this.on("pointerout", this.handlePointerOut);
    this.on("pointerdown", () => {
      this.handlePointerDown();
      Sound.play("click1.ogg");
    });
  }

  private handlePointerOver = () => {
    this.setTint(Color.Grey);
  };

  private handlePointerOut = () => {
    this.setTint(Color.White);
  };

  private calculateFrameSize(): Size {
    return {
      width: this.text.width + Button.PADDING * 2,
      height: this.text.height + Button.PADDING * 2,
    };
  }

  private defineHitArea() {
    const size = this.calculateFrameSize();
    this.hitArea = new PIXI.Rectangle(0, 0, size.width, size.height);
  }

  private enableInteraction() {
    this.defineHitArea();
    this.interactive = true;
  }

  public enable() {
    this.interactive = true;
    this.setTint(Color.White);
  }

  public disable() {
    this.interactive = false;
    this.setTint(Color.DarkGrey);
  }

  public setTint(color: Color) {
    this.frame.tint = color;
    this.text.tint = color;
  }

  public onPointerDown(cb: () => void) {
    this.handlePointerDown = cb;
  }

  public updateText(text: string) {
    this.removeChild(this.frame, this.text);
    this.text.text = text;
    this.defineHitArea();
    this.addChild(this.frame, this.text);
    if (this.isCenterOrigin) this.setCenterAsOriginBasedOnCurrentSize();
  }
}

export default Button;
