import * as PIXI from "pixi.js";
import Sound from "./Sound";
import Texture from "./Texture";

class CheckMark extends PIXI.Sprite {
  private checked: boolean;
  private handlePointerDown = (checked: boolean) => {};

  constructor() {
    super(Texture.from("grey_box.png"));
    this.interactive = true;
    this.checked = false;
    this.on("pointerdown", () => {
      this.checked = !this.checked;
      this.handlePointerDown(this.checked);
      if (this.checked) {
        this.texture = Texture.from("green_boxCheckmark.png");
      } else {
        this.texture = Texture.from("grey_box.png");
      }
      Sound.play("click1.ogg");
    });
  }

  public onPointerDown(cb: (checked: boolean) => void) {
    this.handlePointerDown = cb;
  }
}

export default CheckMark;
