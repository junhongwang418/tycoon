import * as PIXI from "pixi.js";
import Color from "./Color";
import WebFontLoader from "./WebFontLoader";

const defaultFontStyle: Partial<PIXI.ITextStyle> = {
  fontFamily: WebFontLoader.FONT_FAMILY,
  fill: Color.White,
};

class Text extends PIXI.Text {
  constructor(text: string, style?: Partial<PIXI.ITextStyle>) {
    super(text, {
      ...defaultFontStyle,
      ...style,
    });
  }
}

export default Text;
