import * as PIXI from "pixi.js";
import Application from "./Application";
import Color from "./Color";
import Container from "./Container";
import Text from "./Text";

class TextField extends Container {
  private static get PADDING() {
    return Application.spacing(1);
  }

  private static get CORNER_RADIUS() {
    return Application.spacing(1);
  }

  private maxLength: number;
  private frame: PIXI.Graphics;
  private value: string;
  private valueText: Text;

  constructor(maxLength: number) {
    super();
    this.maxLength = maxLength;
    this.frame = this.createFrame();
    this.value = "";
    this.valueText = new Text("", { fill: Color.WHITE });

    this.layout();
    this.draw();

    this.addEventListeners();
  }

  private layout() {
    this.layoutValueText();
  }

  private draw() {
    this.addChild(this.frame);
    this.addChild(this.valueText);
  }

  private createFrame() {
    const frame = new PIXI.Graphics();
    const text = new Text(" ".repeat(this.maxLength));
    frame.lineStyle(1, Color.WHITE);
    frame.beginFill(Color.BLACK);
    frame.drawRoundedRect(
      0,
      0,
      text.width + TextField.PADDING * 2,
      text.height + TextField.PADDING * 2,
      TextField.CORNER_RADIUS
    );
    frame.endFill();
    return frame;
  }

  private addEventListeners() {
    window.addEventListener("keydown", (e) => {
      if (!e.repeat) {
        if (e.key.length === 1) {
          this.value += e.key;
          this.value = this.value.slice(0, this.maxLength);
        } else if (e.key === "Backspace") {
          this.value = this.value.slice(0, -1);
        }
        this.updateValueText();
      }
    });
  }

  private updateValueText() {
    this.valueText.text = this.value;
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
