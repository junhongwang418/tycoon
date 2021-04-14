import * as PIXI from "pixi.js";
import Sound from "./Sound";
import Text from "./Text";

class CheckMark extends Text {
  private checked: boolean;
  private handlePointerDown = (checked: boolean) => {};

  constructor(style?: Partial<PIXI.ITextStyle>) {
    super("☐", style);
    this.interactive = true;
    this.checked = false;
    this.on("pointerdown", () => {
      this.checked = !this.checked;
      this.handlePointerDown(this.checked);
      if (this.checked) {
        this.text = "☑";
      } else {
        this.text = "☐";
      }
      Sound.play("click1.ogg");
    });
  }

  public onPointerDown(cb: (checked: boolean) => void) {
    this.handlePointerDown = cb;
  }
}

export default CheckMark;
