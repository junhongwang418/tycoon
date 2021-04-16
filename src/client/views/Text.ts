import * as PIXI from "pixi.js";
import Color from "../Color";
import View from "./View";
import WebFontLoader from "../WebFontLoader";

const defaultFontStyle: Partial<PIXI.ITextStyle> = {
  fontFamily: WebFontLoader.FONT_FAMILY,
  fill: Color.White,
};

class Text extends View {
  private text: PIXI.Text;

  constructor(text: string, style?: Partial<PIXI.ITextStyle>) {
    super();
    this.text = new PIXI.Text(text, {
      ...defaultFontStyle,
      ...style,
    });
  }

  public getTextSize() {
    return { width: this.text.width, height: this.text.height };
  }

  public updateText(text: string) {
    this.text.text = text;
    if (this.isCenterOrigin) this.setCenterAsOriginBasedOnCurrentSize();
  }

  public setTint(color: Color) {
    this.text.tint = color;
  }

  protected draw() {
    super.draw();
    this.addChild(this.text);
  }
}

export default Text;
