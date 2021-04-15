import * as PIXI from "pixi.js";
import Application from "./Application";
import Button from "./Button";
import Color from "./Color";
import Overlay from "./Overlay";
import Text from "./Text";

class Alert extends Overlay {
  private static get WIDTH() {
    return (Application.WIDTH * 2) / 3;
  }

  private static get HEIGHT() {
    return Application.HEIGHT / 2;
  }

  private frame: PIXI.Graphics;
  private text: Text;
  private okButton: Button;
  private handleOkButtonPointerDown: () => void;

  constructor(text: string) {
    super();
    this.frame = this.createFrame();
    this.text = new Text(text, { fill: Color.WHITE });
    this.okButton = this.createOkButton();
    this.layout();
    this.draw();
  }

  private layout() {
    this.layoutFrame();
    this.layoutText();
    this.layoutOkButton();
  }

  private draw() {
    this.addChild(this.frame);
    this.addChild(this.text);
    this.addChild(this.okButton);
  }

  private createFrame() {
    const frame = new PIXI.Graphics();
    frame.lineStyle(1, Color.WHITE);
    frame.drawRect(0, 0, Alert.WIDTH, Alert.HEIGHT);
    return frame;
  }

  private layoutFrame() {
    this.frame.x = (Application.WIDTH - Alert.WIDTH) / 2;
    this.frame.y = (Application.HEIGHT - Alert.HEIGHT) / 2;
  }

  private createOkButton() {
    const button = new Button("Ok");
    button.onPointerDown(() => this.handleOkButtonPointerDown());
    return button;
  }

  private layoutText() {
    this.text.anchor.set(0.5);
    this.text.x = Application.WIDTH / 2;
    this.text.y = Application.HEIGHT / 2 - Application.spacing(5);
  }

  private layoutOkButton() {
    this.okButton.setCenterAsOrigin();
    this.okButton.x = Application.WIDTH / 2;
    this.okButton.y = Application.HEIGHT / 2 + Application.spacing(5);
  }

  public onOkButtonPointerDown(cb: () => void) {
    this.handleOkButtonPointerDown = cb;
  }
}

export default Alert;
