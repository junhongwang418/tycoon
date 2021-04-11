import * as PIXI from "pixi.js";
import { CardSuit, CardValue } from "../common/Card";

class Texture {
  public static getFilePaths() {
    const filePaths = [];

    const values = Object.values(CardValue).filter(
      (v) => v !== CardValue.Joker
    );
    const suits = Object.values(CardSuit).filter((s) => s !== CardSuit.Joker);

    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < suits.length; j++) {
        filePaths.push(`card${suits[j]}${values[i]}.png`);
      }
    }

    filePaths.push("cardJoker.png");
    filePaths.push("grey_box.png");
    filePaths.push("green_boxCheckmark.png");

    return filePaths;
  }

  public static from(filePath: string) {
    const loader = PIXI.Loader.shared;
    return loader.resources[filePath].texture;
  }
}

export default Texture;
