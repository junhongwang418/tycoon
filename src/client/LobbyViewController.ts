import * as PIXI from "pixi.js";
import Application from "./Application";
import Color from "./Color";
import Text from "./Text";
import ViewController from "./ViewController";
import Button from "./Button";
import HostRoomViewController from "./HostRoomViewController";
import Popup from "./Popup";
import Container from "./Container";
import GuestRoomViewController from "./GuestRoomViewController";

class TextField extends Container {
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

  private layout() {}

  private draw() {
    this.addChild(this.frame);
    this.addChild(this.valueText);
  }

  private createFrame() {
    const frame = new PIXI.Graphics();
    const text = new Text(" ".repeat(this.maxLength));
    frame.lineStyle(1, Color.WHITE);
    frame.beginFill(Color.BLACK);
    frame.drawRect(0, 0, text.width, text.height);
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

  public getValue() {
    return this.value;
  }
}

class JoinRoomPopup extends Popup {
  private static get WIDTH() {
    return Application.WIDTH / 2;
  }

  private static get HEIGHT() {
    return Application.WIDTH / 2;
  }

  private frame: PIXI.Graphics;
  private enterRoomIdText: Text;
  private roomIdTextField: TextField;
  private closeButton: Button;
  private joinButton: Button;
  private handleCloseButtonPointerDown: () => void;
  private handleJoinButtonPointerDown: (roomId: string) => void;

  constructor() {
    super();
    this.frame = this.createFrame();
    this.closeButton = this.createCloseButton();
    this.joinButton = this.createJoinButton();
    this.roomIdTextField = new TextField(5);
    this.enterRoomIdText = new Text("Enter Room ID", { fill: Color.WHITE });
    this.layout();
    this.draw();
  }

  private layout() {
    this.layoutFrame();
    this.layoutCloseButton();
    this.layoutJoinButton();
    this.layoutRoomIdTextField();
    this.layoutEnterRoomIdText();
  }

  private draw() {
    this.addChild(this.frame);
    this.frame.addChild(this.closeButton);
    this.frame.addChild(this.joinButton);
    this.frame.addChild(this.roomIdTextField);
    this.frame.addChild(this.enterRoomIdText);
  }

  private layoutFrame() {
    this.frame.x = (Application.WIDTH - JoinRoomPopup.WIDTH) / 2;
    this.frame.y = (Application.HEIGHT - JoinRoomPopup.HEIGHT) / 2;
  }

  private layoutRoomIdTextField() {
    this.roomIdTextField.setCenterAsOrigin();
    this.roomIdTextField.x = JoinRoomPopup.WIDTH / 2;
    this.roomIdTextField.y = JoinRoomPopup.HEIGHT / 2 - Application.spacing(5);
  }

  private layoutEnterRoomIdText() {
    this.enterRoomIdText.anchor.set(0.5);
    this.enterRoomIdText.x = JoinRoomPopup.WIDTH / 2;
    this.enterRoomIdText.y = JoinRoomPopup.HEIGHT / 2 - Application.spacing(12);
  }

  private layoutCloseButton() {
    this.closeButton.setCenterAsOrigin();
  }

  private layoutJoinButton() {
    this.joinButton.setCenterAsOrigin();
    this.joinButton.x = JoinRoomPopup.WIDTH / 2;
    this.joinButton.y = JoinRoomPopup.HEIGHT / 2 + Application.spacing(5);
  }

  private createJoinButton() {
    const button = new Button("Join");
    button.onPointerDown(() =>
      this.handleJoinButtonPointerDown(this.roomIdTextField.getValue())
    );
    return button;
  }

  private createFrame() {
    const frame = new PIXI.Graphics();
    frame.lineStyle(1, Color.WHITE);
    frame.drawRect(0, 0, JoinRoomPopup.WIDTH, JoinRoomPopup.HEIGHT);
    return frame;
  }

  private createCloseButton() {
    const button = new Button("❌");
    button.onPointerDown(() => this.handleCloseButtonPointerDown());
    return button;
  }

  public onClose(cb: () => void) {
    this.handleCloseButtonPointerDown = cb;
  }

  public onJoin(cb: (roomId: string) => void) {
    this.handleJoinButtonPointerDown = cb;
  }
}

class LobbyViewController extends ViewController {
  private titleText: Text;
  private createRoomButton: Button;
  private joinRoomButton: Button;
  private joinRoomPopup: JoinRoomPopup;

  constructor() {
    super();
    this.titleText = new Text("🃏 Tycoon 🃏", { fill: Color.WHITE });
    this.createRoomButton = this.createCreateRoomButton();
    this.joinRoomButton = this.createJoinRoomButton();
    this.joinRoomPopup = this.createJoinRoomPopup();
  }

  protected layout() {
    this.layoutTitleText();
    this.layoutCreateRoomButton();
    this.layoutJoinRoomButton();
  }

  protected draw() {
    this.addChild(this.titleText);
    this.addChild(this.createRoomButton);
    this.addChild(this.joinRoomButton);
  }

  protected addEventListeners() {
    const socket = Application.shared.socket;
    socket.on("create-room-success", this.handleSocketCreateRoomSuccess);
    socket.on("join-room-success", this.handleSocketJoinRoomSuccess);
  }

  protected removeEventListeners() {
    const socket = Application.shared.socket;
    socket.off("create-room-success", this.handleSocketCreateRoomSuccess);
    socket.off("join-room-success", this.handleSocketJoinRoomSuccess);
  }

  private layoutCreateRoomButton() {
    this.createRoomButton.setCenterAsOrigin();
    this.createRoomButton.x = Application.WIDTH / 2;
    this.createRoomButton.y = Application.HEIGHT / 2 - Application.spacing(5);
  }

  private layoutJoinRoomButton() {
    this.joinRoomButton.setCenterAsOrigin();
    this.joinRoomButton.x = Application.WIDTH / 2;
    this.joinRoomButton.y = Application.HEIGHT / 2 + Application.spacing(5);
  }

  private layoutTitleText() {
    this.titleText.anchor.set(0.5);
    this.titleText.x = Application.WIDTH / 2;
    this.titleText.y = Application.HEIGHT / 4;
  }

  private createJoinRoomPopup() {
    const popup = new JoinRoomPopup();
    popup.onClose(() => {
      this.removeChild(this.joinRoomPopup);
    });
    popup.onJoin((roomId: string) => {
      const socket = Application.shared.socket;
      socket.emit("join-room", roomId);
    });
    return popup;
  }

  private createCreateRoomButton() {
    const button = new Button("Create Room 🏠");
    button.onPointerDown(this.handleCreateRoomButtonPointerDown);
    return button;
  }

  private createJoinRoomButton() {
    const button = new Button("Join Room 🚪");
    button.onPointerDown(this.handleJoinRoomButtonPointerDown);
    return button;
  }

  private handleCreateRoomButtonPointerDown = () => {
    const socket = Application.shared.socket;
    socket.emit("create-room");
  };

  private handleJoinRoomButtonPointerDown = () => {
    this.addChild(this.joinRoomPopup);
  };

  private handleSocketCreateRoomSuccess = (roomId: string) => {
    this.loadViewController(new HostRoomViewController(roomId));
  };

  private handleSocketJoinRoomSuccess = (roomId: string) => {
    this.loadViewController(new GuestRoomViewController(roomId));
  };
}

export default LobbyViewController;
