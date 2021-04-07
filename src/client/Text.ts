import * as PIXI from "pixi.js";
import WebFontLoader from "./WebFontLoader";

class Text extends PIXI.Text {
  constructor(text: string, style?: Partial<PIXI.ITextStyle>) {
    super(text, {
      fontFamily: WebFontLoader.FONT_FAMILY,
      ...style,
    });
  }
}

export default Text;
