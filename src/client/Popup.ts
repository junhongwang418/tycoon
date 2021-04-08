import * as PIXI from "pixi.js";
import Button from "./Button";
import Color from "./Color";
import Text from "./Text";

class Popup extends PIXI.Container {
  public static readonly WIDTH = 800;
  public static readonly HEIGHT = 400;

  private okButton: Button;
  private prompt: string;

  constructor(prompt: string) {
    super();
    this.prompt = prompt;
    this.okButton = new Button("ok");
    this.draw();
  }

  private draw() {
    this.drawFrame();
    this.drawPromptText();
    this.drawOkButton();
  }

  private drawFrame() {
    const frame = new PIXI.Graphics();
    frame.lineStyle(1, Color.WHITE);
    frame.beginFill(Color.BLACK);
    frame.drawRect(0, 0, Popup.WIDTH, Popup.HEIGHT);
    frame.endFill();
    this.addChild(frame);
  }

  private drawPromptText() {
    const text = new Text(this.prompt, { fill: Color.WHITE });
    text.anchor.set(0.5);
    text.x = Popup.WIDTH / 2;
    text.y = Popup.HEIGHT / 2 - 100;
    this.addChild(text);
  }

  private drawOkButton() {
    this.okButton.x = Popup.WIDTH / 2 - this.okButton.width / 2;
    this.okButton.y = Popup.HEIGHT / 2 + 100;
    this.addChild(this.okButton);
  }

  public onOk(cb: () => void) {
    this.okButton.on("pointerdown", cb);
  }
}

export default Popup;
