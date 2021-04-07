import * as PIXI from "pixi.js";
import WebFontLoader from "./WebFontLoader";

const defaultFontStyle: Partial<PIXI.ITextStyle> = {
  fontFamily: WebFontLoader.FONT_FAMILY,
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
