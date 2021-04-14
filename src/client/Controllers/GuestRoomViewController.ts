import Alert from "../Alert";
import Application from "../Application";
import Color from "../Color";
import LobbyViewController from "./LobbyViewController";
import RoomViewController from "./RoomViewController";
import Text from "../Text";
import { RoomJson } from "../../common/Room";

class GuestRoomViewController extends RoomViewController {
  private promptText: Text;
  private hostLeftRoomAlert: Alert;

  constructor(roomId: string) {
    super(roomId);
    this.promptText = new Text("Waiting for the host to start the game...", {
      fill: Color.WHITE,
    });
    this.hostLeftRoomAlert = this.createHostLeftRoomAlert();
  }

  protected layout() {
    super.layout();
    this.layoutPromptText();
  }

  protected draw() {
    super.draw();
    this.addChild(this.promptText);
  }

  protected handleSocketRoomStatusUpdate(roomJson: RoomJson) {
    super.handleSocketRoomStatusUpdate(roomJson);
    this.tycoonOptionsText.setTycoonOptions(roomJson.options);
  }

  protected addEventListeners() {
    super.addEventListeners();
    const socket = Application.shared.socket;
    socket.on("host-left-room", this.handleSocketHostLeaveRoom);
  }

  protected removeEventListeners() {
    super.removeEventListeners();
    const socket = Application.shared.socket;
    socket.off("host-left-room", this.handleSocketHostLeaveRoom);
  }

  private handleSocketHostLeaveRoom = () => {
    this.addChild(this.hostLeftRoomAlert);
  };

  private layoutPromptText() {
    this.promptText.anchor.set(0.5);
    this.promptText.x = Application.WIDTH / 2;
    this.promptText.y = Application.HEIGHT / 2;
  }

  private createHostLeftRoomAlert() {
    const alert = new Alert("The host left the room :(");
    alert.onOkButtonPointerDown(() => {
      this.loadViewController(new LobbyViewController());
    });
    return alert;
  }
}

export default GuestRoomViewController;
