import * as PIXI from "pixi.js";

class Texture {
  public static getFilePaths() {
    const filePaths = [];
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
