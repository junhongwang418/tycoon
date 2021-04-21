import Application from "../Application";
import Text from "../views/Text";
import ViewController from "./ViewController";
import Button from "../views/Button";
import HostRoomViewController from "./HostRoomViewController";
import GuestRoomViewController from "./GuestRoomViewController";
import Layout from "../Layout";
import JoinRoomOverlay from "../views/JoinRoomOverlay";
import CreateRoomOverlay from "../views/CreateRoomOverlay";
import { RoomJson } from "../../common/Room";
import Speech from "../views/Speech";

class LobbyViewController extends ViewController {
  private titleText: Text;

  private createRoomButton: Button;
  private joinRoomButton: Button;

  private createRoomOverlay: CreateRoomOverlay;
  private joinRoomOverlay: JoinRoomOverlay;

  constructor() {
    super();
    this.titleText = new Text("💁 Lobby 💁");
    this.createRoomButton = this.createCreateRoomButton();
    this.joinRoomButton = this.createJoinRoomButton();
    this.createRoomOverlay = this.createCreateRoomOverlay();
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

  public addEventListeners() {
    super.addEventListeners();
    const socket = Application.shared.socket;
    socket.on("lobby-create-room-success", this.handleSocketCreateRoomSuccess);
    socket.on("lobby-join-room-success", this.handleSocketJoinRoomSuccess);
  }

  public removeEventListeners() {
    super.removeEventListeners();
    const socket = Application.shared.socket;
    socket.off("lobby-create-room-success", this.handleSocketCreateRoomSuccess);
    socket.off("lobby-join-room-success", this.handleSocketJoinRoomSuccess);
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
    socket.emit("lobby-join-room", roomId);
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

  private createCreateRoomOverlay() {
    const overlay = new CreateRoomOverlay();
    overlay.onCreate(this.handleCreateButtonPointerDown);
    return overlay;
  }

  private handleCreateButtonPointerDown = () => {
    const socket = Application.shared.socket;
    socket.emit("lobby-create-room", this.createRoomOverlay.getCapacity());
  };

  private handleCreateRoomButtonPointerDown = () => {
    this.addView(this.createRoomOverlay);
  };

  private handleJoinRoomButtonPointerDown = () => {
    this.addView(this.joinRoomOverlay);
  };

  private handleSocketCreateRoomSuccess = (roomJson: RoomJson) => {
    this.loadViewController(new HostRoomViewController(roomJson));
  };

  private handleSocketJoinRoomSuccess = (roomJson: RoomJson) => {
    this.loadViewController(new GuestRoomViewController(roomJson));
  };
}

export default LobbyViewController;
