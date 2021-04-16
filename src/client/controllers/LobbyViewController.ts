import * as PIXI from "pixi.js";
import Application from "../Application";
import Color from "../Color";
import Text from "../Text";
import ViewController from "./ViewController";
import Button from "../Button";
import HostRoomViewController from "./HostRoomViewController";
import Overlay from "../Overlay";
import GuestRoomViewController from "./GuestRoomViewController";
import TextField from "../TextField";
import Layout from "../Layout";

class JoinRoomOverlay extends Overlay {
  private static get WIDTH() {
    return Application.WIDTH / 2;
  }

  private static get HEIGHT() {
    return Application.WIDTH / 3;
  }

  private frame: PIXI.Graphics;
  private enterRoomIdText: Text;
  private roomIdTextField: TextField;
  private closeButton: Button;
  private joinButton: Button;

  constructor() {
    super();
    this.frame = this.createFrame();
    this.closeButton = this.createCloseButton();
    this.joinButton = new Button("Join");
    this.roomIdTextField = new TextField(5);
    this.enterRoomIdText = new Text("Enter Room ID");
    this.layout();
    this.draw();
  }

  public onJoin(cb: (roomId: string) => void) {
    this.joinButton.onPointerDown(() => cb(this.roomIdTextField.getValue()));
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
    this.frame.x = (Application.WIDTH - JoinRoomOverlay.WIDTH) / 2;
    this.frame.y = (Application.HEIGHT - JoinRoomOverlay.HEIGHT) / 2;
  }

  private layoutRoomIdTextField() {
    this.roomIdTextField.setCenterAsOrigin();
    this.roomIdTextField.x = JoinRoomOverlay.WIDTH / 2;
    this.roomIdTextField.y = JoinRoomOverlay.HEIGHT / 2 - Layout.spacing(5);
  }

  private layoutEnterRoomIdText() {
    this.enterRoomIdText.anchor.set(0.5);
    this.enterRoomIdText.x = JoinRoomOverlay.WIDTH / 2;
    this.enterRoomIdText.y = JoinRoomOverlay.HEIGHT / 2 - Layout.spacing(12);
  }

  private layoutCloseButton() {
    this.closeButton.setCenterAsOrigin();
  }

  private layoutJoinButton() {
    this.joinButton.setCenterAsOrigin();
    this.joinButton.x = JoinRoomOverlay.WIDTH / 2;
    this.joinButton.y = JoinRoomOverlay.HEIGHT / 2 + Layout.spacing(5);
  }

  private createFrame() {
    const frame = new PIXI.Graphics();
    frame.lineStyle(1, Color.White);
    frame.drawRect(0, 0, JoinRoomOverlay.WIDTH, JoinRoomOverlay.HEIGHT);
    return frame;
  }

  private createCloseButton() {
    const button = new Button("❌");
    button.onPointerDown(this.handleCloseButtonPointerDown);
    return button;
  }

  private handleCloseButtonPointerDown = () => {
    this.parent.removeChild(this);
  };
}

class LobbyViewController extends ViewController {
  private titleText: Text;
  private createRoomButton: Button;
  private backButton: Button;
  private joinRoomButton: Button;
  private joinRoomOverlay: JoinRoomOverlay;

  constructor() {
    super();
    this.titleText = new Text("💁 Lobby 💁");
    this.createRoomButton = this.createCreateRoomButton();
    this.joinRoomButton = this.createJoinRoomButton();
    this.joinRoomOverlay = this.createJoinRoomPopup();
    this.backButton = this.createBackButton();
  }

  protected layout() {
    super.layout();
    this.layoutTitleText();
    this.layoutCreateRoomButton();
    this.layoutJoinRoomButton();
    this.layoutBackButton();
  }

  protected draw() {
    super.draw();
    this.addChild(this.titleText);
    this.addChild(this.createRoomButton);
    this.addChild(this.joinRoomButton);
    this.addChild(this.backButton);
  }

  protected addEventListeners() {
    super.addEventListeners();
    const socket = Application.shared.socket;
    socket.on("create-room-success", this.handleSocketCreateRoomSuccess);
    socket.on("join-room-success", this.handleSocketJoinRoomSuccess);
  }

  protected removeEventListeners() {
    super.removeEventListeners();
    const socket = Application.shared.socket;
    socket.off("create-room-success", this.handleSocketCreateRoomSuccess);
    socket.off("join-room-success", this.handleSocketJoinRoomSuccess);
  }

  private layoutCreateRoomButton() {
    this.createRoomButton.setCenterAsOrigin();
    this.createRoomButton.x = Application.WIDTH / 2;
    this.createRoomButton.y = Application.HEIGHT / 2 - Layout.spacing(5);
  }

  private layoutJoinRoomButton() {
    this.joinRoomButton.setCenterAsOrigin();
    this.joinRoomButton.x = Application.WIDTH / 2;
    this.joinRoomButton.y = Application.HEIGHT / 2 + Layout.spacing(5);
  }

  private layoutBackButton() {
    this.backButton.x = Layout.spacing(1);
    this.backButton.y = Layout.spacing(1);
  }

  private layoutTitleText() {
    this.titleText.anchor.set(0.5);
    this.titleText.x = Application.WIDTH / 2;
    this.titleText.y = Application.HEIGHT / 4;
  }

  private createJoinRoomPopup() {
    const popup = new JoinRoomOverlay();
    popup.onJoin(this.handleJoin);
    return popup;
  }

  private handleJoin = (roomId: string) => {
    const socket = Application.shared.socket;
    socket.emit("join-room", roomId);
  };

  private createBackButton() {
    const button = new Button("← Back");
    button.onPointerDown(this.handleBackButtonPointerDown);
    return button;
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

  private handleBackButtonPointerDown = () => {
    this.popViewController();
  };

  private handleCreateRoomButtonPointerDown = () => {
    const socket = Application.shared.socket;
    socket.emit("create-room");
  };

  private handleJoinRoomButtonPointerDown = () => {
    this.addChild(this.joinRoomOverlay);
  };

  private handleSocketCreateRoomSuccess = (roomId: string) => {
    this.loadViewController(new HostRoomViewController(roomId));
  };

  private handleSocketJoinRoomSuccess = (roomId: string) => {
    this.loadViewController(new GuestRoomViewController(roomId));
  };
}

export default LobbyViewController;
