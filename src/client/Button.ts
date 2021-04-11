import * as PIXI from "pixi.js";
import Color from "./Color";
import Container from "./Container";
import Sound from "./Sound";
import Text from "./Text";

class Button extends Container {
  private static readonly PADDING = 8;

  private text: Text;
  private frame: PIXI.Graphics;

  private handlePointerDown = () => {};

  constructor(text: string) {
    super();
    this.text = new Text(text);
    this.frame = new PIXI.Graphics();
    this.enableInteraction();
    this.addEventListeners();
    this.draw();
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

  private undrawFrame() {
    this.removeChild(this.frame);
  }

  private calculateSize(): { width: number; height: number } {
    return {
      width: this.text.width + Button.PADDING * 2,
      height: this.text.height + Button.PADDING * 2,
    };
  }

  private drawText() {
    this.text.x = Button.PADDING;
    this.text.y = Button.PADDING;
    this.addChild(this.text);
  }

  private undrawText() {
    this.removeChild(this.text);
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

  public onPointerDown(cb: () => void) {
    this.handlePointerDown = cb;
  }

  public updateText(text: string) {
    this.undrawFrame();
    this.undrawText();
    this.text.text = text;
    this.defineHitArea();
    this.drawFrame();
    this.drawText();

    if (this.isOriginCenter) {
      this.setCenterAsOriginBasedOnCurrentSize();
    }
  }
}

export default Button;
