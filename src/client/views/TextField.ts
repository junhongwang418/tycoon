import Color from "../Color";
import View from "./View";
import Layout from "../Layout";
import Text from "./Text";
import Frame from "./Frame";

class TextField extends View {
  private static get PADDING() {
    return Layout.spacing(1);
  }

  private static get CORNER_RADIUS() {
    return Layout.spacing(1);
  }

  private maxLength: number;
  private frame: Frame;
  private value: string;
  private valueText: Text;

  constructor(maxLength: number) {
    super();
    this.maxLength = maxLength;
    this.frame = this.createFrame();
    this.value = "";
    this.valueText = new Text("");
  }

  protected layout() {
    super.layout();
    this.layoutValueText();
  }

  protected draw() {
    super.draw();
    this.addView(this.frame);
    this.addView(this.valueText);
  }

  private createFrame() {
    const text = " ".repeat(this.maxLength);
    const { width, height } = new Text(text).getTextSize();
    return new Frame({
      width: width + TextField.PADDING * 2,
      height: height + TextField.PADDING * 2,
      border: Color.White,
      cornerRadius: TextField.CORNER_RADIUS,
    });
  }

  public addEventListeners() {
    super.addEventListeners();
    window.addEventListener("keydown", this.handleKeyDown);
  }

  public removeEventListeners() {
    super.removeEventListeners();
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (!e.repeat) {
      if (e.key.length === 1) {
        this.value += e.key;
        this.value = this.value.slice(0, this.maxLength);
      } else if (e.key === "Backspace") {
        this.value = this.value.slice(0, -1);
      }
      this.updateValueText();
    }
  };

  private updateValueText() {
    this.valueText.updateText(this.value);
  }

  private layoutValueText() {
    this.valueText.x = TextField.PADDING;
    this.valueText.y = TextField.PADDING;
  }

  public getValue() {
    return this.value;
  }
}

export default TextField;
