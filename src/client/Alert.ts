import * as PIXI from "pixi.js";
import Application from "./Application";
import Button from "./Button";
import Color from "./Color";
import Layout from "./Layout";
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

  constructor(text: string) {
    super();
    this.frame = this.createFrame();
    this.text = new Text(text);
    this.okButton = new Button("Ok");
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
    this.frame.addChild(this.text);
    this.frame.addChild(this.okButton);
  }

  private createFrame() {
    const frame = new PIXI.Graphics();
    frame.lineStyle(1, Color.White);
    frame.drawRect(0, 0, Alert.WIDTH, Alert.HEIGHT);
    return frame;
  }

  private layoutFrame() {
    this.frame.x = (Application.WIDTH - Alert.WIDTH) / 2;
    this.frame.y = (Application.HEIGHT - Alert.HEIGHT) / 2;
  }

  private layoutText() {
    this.text.anchor.set(0.5);
    this.text.x = Alert.WIDTH / 2;
    this.text.y = Alert.HEIGHT / 2 - Layout.spacing(5);
  }

  private layoutOkButton() {
    this.okButton.setCenterAsOrigin();
    this.okButton.x = Alert.WIDTH / 2;
    this.okButton.y = Alert.HEIGHT / 2 + Layout.spacing(5);
  }

  public onOk(cb: () => void) {
    this.okButton.onPointerDown(cb);
  }
}

export default Alert;
