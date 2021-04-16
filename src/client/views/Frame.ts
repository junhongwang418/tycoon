import * as PIXI from "pixi.js";
import Color from "../Color";
import View from "./View";

interface FrameOptions {
  width: number;
  height: number;
  fill?: Color;
  border?: Color;
  cornerRadius?: number;
}

class Frame extends View {
  private graphics: PIXI.Graphics;

  constructor(options: FrameOptions) {
    super();
    this.graphics = this.createGraphics(options);
  }

  protected draw() {
    super.draw();
    this.addChild(this.graphics);
  }

  private createGraphics(options: FrameOptions) {
    const { width, height, fill, border, cornerRadius } = options;
    const graphics = new PIXI.Graphics();
    if (border) graphics.lineStyle(1, border);
    if (fill) graphics.beginFill(fill);
    if (cornerRadius) {
      graphics.drawRoundedRect(0, 0, width, height, cornerRadius);
    } else {
      graphics.drawRect(0, 0, width, height);
    }
    if (fill) graphics.endFill();
    return graphics;
  }

  public setTint(color: Color) {
    this.graphics.tint = color;
  }

  public onPointerDown(cb: () => void) {}
}

export default Frame;
