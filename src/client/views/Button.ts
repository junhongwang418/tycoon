import * as PIXI from "pixi.js";
import Color from "../Color";
import View from "./View";
import Sound from "../Sound";
import Text from "./Text";
import Frame from "./Frame";

class Button extends View {
  private static readonly PADDING = 8;

  private title: string;

  private text: Text;
  private border: Frame;
  private background: Frame;

  private pointerDownCallback = () => {};

  constructor(text: string) {
    super();
    this.title = text;
    this.text = new Text(text);
    this.border = this.createBorder();
    this.background = this.createBackground();
    this.enableInteraction();
  }

  protected layout() {
    super.layout();
    this.layoutText();
  }

  protected draw() {
    super.draw();
    this.addView(this.background);
    this.addView(this.border);
    this.addView(this.text);
  }

  private createBorder() {
    const { width, height } = this.getSize();
    return new Frame({
      width,
      height,
      border: Color.White,
    });
  }

  private createBackground() {
    const { width, height } = this.getSize();
    return new Frame({
      width,
      height,
      fill: Color.Black,
    });
  }

  private layoutText() {
    this.text.x = Button.PADDING;
    this.text.y = Button.PADDING;
  }

  public addEventListeners() {
    super.addEventListeners();
    this.on("pointerover", this.handlePointerOver);
    this.on("pointerout", this.handlePointerOut);
    this.on("pointerdown", this.handlePointerDown);
  }

  public removeEventListeners() {
    super.removeAllListeners();
    this.off("pointerover", this.handlePointerOver);
    this.off("pointerout", this.handlePointerOut);
    this.off("pointerdown", this.handlePointerDown);
  }

  private handlePointerDown = () => {
    this.setAlpha(1);
    this.pointerDownCallback();
    Sound.play("click1.ogg");
  };

  private handlePointerOver = () => {
    this.setAlpha(0.62);
  };

  private handlePointerOut = () => {
    this.setAlpha(1);
  };

  public getSize() {
    const { width, height } = new Text(this.title).getTextSize();
    return {
      width: width + Button.PADDING * 2,
      height: height + Button.PADDING * 2,
    };
  }

  private defineHitArea() {
    const size = this.getSize();
    this.hitArea = new PIXI.Rectangle(0, 0, size.width, size.height);
  }

  private enableInteraction() {
    this.defineHitArea();
    this.interactive = true;
  }

  public enable() {
    this.interactive = true;
    this.setAlpha(1);
  }

  public disable() {
    this.interactive = false;
    this.setAlpha(0.2);
  }

  public setAlpha(alpha: number) {
    this.border.alpha = alpha;
    this.text.alpha = alpha;
  }

  public onPointerDown(cb: () => void) {
    this.pointerDownCallback = cb;
  }

  public updateText(text: string) {
    this.title = text;
    this.text.updateText(text);
    this.removeViews(this.background, this.border, this.text);
    this.defineHitArea();
    this.addChild(this.background, this.border, this.text);
    if (this.isCenterOrigin) this.setCenterAsOriginBasedOnCurrentSize();
  }
}

export default Button;
