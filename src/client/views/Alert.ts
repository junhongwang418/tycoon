import Application from "../Application";
import Button from "./Button";
import Layout from "../Layout";
import Overlay from "./Overlay";
import Text from "./Text";
import Frame from "./Frame";
import Color from "../Color";

class Alert extends Overlay {
  private static get WIDTH() {
    return (Application.WIDTH * 2) / 3;
  }

  private static get HEIGHT() {
    return Application.HEIGHT / 2;
  }

  private frame: Frame;
  private text: Text;
  private okButton: Button;

  constructor(text: string) {
    super();
    this.frame = new Frame({
      width: Alert.WIDTH,
      height: Alert.HEIGHT,
      border: Color.White,
    });
    this.text = new Text(text);
    this.okButton = new Button("Ok");
  }

  protected layout() {
    super.layout();
    this.layoutFrame();
    this.layoutText();
    this.layoutOkButton();
  }

  protected draw() {
    super.draw();
    this.addView(this.frame);
    this.frame.addView(this.text);
    this.frame.addView(this.okButton);
  }

  private layoutFrame() {
    this.frame.x = (Application.WIDTH - Alert.WIDTH) / 2;
    this.frame.y = (Application.HEIGHT - Alert.HEIGHT) / 2;
  }

  private layoutText() {
    this.text.setCenterAsOrigin();
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
