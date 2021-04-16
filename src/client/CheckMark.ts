import * as PIXI from "pixi.js";
import Sound from "./Sound";
import Text from "./Text";

class CheckMark extends Text {
  private checked: boolean;

  constructor(style?: Partial<PIXI.ITextStyle>) {
    super("☐", style);
    this.checked = false;
    this.interactive = true;
  }

  public onPointerDown(cb: (checked: boolean) => void) {
    this.on("pointerdown", () => {
      this.checked = !this.checked;
      cb(this.checked);
      this.text = this.checked ? "☑" : "☐";
      Sound.play("click1.ogg");
    });
  }
}

export default CheckMark;
