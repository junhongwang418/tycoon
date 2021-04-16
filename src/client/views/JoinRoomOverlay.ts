import Application from "../Application";
import Color from "../Color";
import ViewController from "../controllers/ViewController";
import Layout from "../Layout";
import Button from "./Button";
import Frame from "./Frame";
import Overlay from "./Overlay";
import Text from "./Text";
import TextField from "./TextField";
import View from "./View";

class JoinRoomOverlay extends Overlay {
  private static get WIDTH() {
    return Application.WIDTH / 2;
  }

  private static get HEIGHT() {
    return Application.WIDTH / 3;
  }

  private frame: Frame;
  private enterRoomIdText: Text;
  private roomIdTextField: TextField;
  private closeButton: Button;
  private joinButton: Button;

  constructor() {
    super();
    this.frame = new Frame({
      width: JoinRoomOverlay.WIDTH,
      height: JoinRoomOverlay.HEIGHT,
      border: Color.White,
    });
    this.closeButton = this.createCloseButton();
    this.joinButton = new Button("Join");
    this.roomIdTextField = new TextField(5);
    this.enterRoomIdText = new Text("Enter Room ID");
  }

  public onJoin(cb: (roomId: string) => void) {
    this.joinButton.onPointerDown(() => cb(this.roomIdTextField.getValue()));
  }

  protected layout() {
    super.layout();
    this.layoutFrame();
    this.layoutCloseButton();
    this.layoutJoinButton();
    this.layoutRoomIdTextField();
    this.layoutEnterRoomIdText();
  }

  protected draw() {
    super.draw();
    this.addView(this.frame);
    this.frame.addView(this.closeButton);
    this.frame.addView(this.joinButton);
    this.frame.addView(this.roomIdTextField);
    this.frame.addView(this.enterRoomIdText);
  }

  private layoutFrame() {
    this.frame.x = (Application.WIDTH - JoinRoomOverlay.WIDTH) / 2;
    this.frame.y = (Application.HEIGHT - JoinRoomOverlay.HEIGHT) / 2;
  }

  private layoutRoomIdTextField() {
    this.roomIdTextField.setCenterAsOrigin();
    this.roomIdTextField.x = JoinRoomOverlay.WIDTH / 2;
    this.roomIdTextField.y = JoinRoomOverlay.HEIGHT / 2;
  }

  private layoutEnterRoomIdText() {
    this.enterRoomIdText.setCenterAsOrigin();
    this.enterRoomIdText.x = JoinRoomOverlay.WIDTH / 2;
    this.enterRoomIdText.y = JoinRoomOverlay.HEIGHT / 2 - Layout.spacing(10);
  }

  private layoutCloseButton() {
    this.closeButton.setCenterAsOrigin();
  }

  private layoutJoinButton() {
    this.joinButton.setCenterAsOrigin();
    this.joinButton.x = JoinRoomOverlay.WIDTH / 2;
    this.joinButton.y = JoinRoomOverlay.HEIGHT / 2 + Layout.spacing(10);
  }

  private createCloseButton() {
    const button = new Button("⨯");
    button.onPointerDown(this.handleCloseButtonPointerDown);
    return button;
  }

  private handleCloseButtonPointerDown = () => {
    const vc = this.parent as ViewController | View;
    vc.removeView(this);
  };
}

export default JoinRoomOverlay;
