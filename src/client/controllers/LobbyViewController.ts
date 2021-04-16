import Application from "../Application";
import Text from "../views/Text";
import ViewController from "./ViewController";
import Button from "../views/Button";
import HostRoomViewController from "./HostRoomViewController";
import GuestRoomViewController from "./GuestRoomViewController";
import Layout from "../Layout";
import JoinRoomOverlay from "../views/JoinRoomOverlay";

class LobbyViewController extends ViewController {
  private titleText: Text;
  private createRoomButton: Button;
  private joinRoomButton: Button;
  private joinRoomOverlay: JoinRoomOverlay;

  constructor() {
    super();
    this.titleText = new Text("💁 Lobby 💁");
    this.createRoomButton = this.createCreateRoomButton();
    this.joinRoomButton = this.createJoinRoomButton();
    this.joinRoomOverlay = this.createJoinRoomPopup();
  }

  protected layout() {
    super.layout();
    this.layoutTitleText();
    this.layoutCreateRoomButton();
    this.layoutJoinRoomButton();
  }

  protected draw() {
    super.draw();
    this.addView(this.titleText);
    this.addView(this.createRoomButton);
    this.addView(this.joinRoomButton);
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

  private layoutTitleText() {
    this.titleText.setCenterAsOrigin();
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
    this.addView(this.joinRoomOverlay);
  };

  private handleSocketCreateRoomSuccess = (roomId: string) => {
    this.loadViewController(new HostRoomViewController(roomId));
  };

  private handleSocketJoinRoomSuccess = (roomId: string) => {
    this.loadViewController(new GuestRoomViewController(roomId));
  };
}

export default LobbyViewController;
