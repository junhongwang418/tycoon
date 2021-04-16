import Alert from "../Alert";
import Application from "../Application";
import LobbyViewController from "./LobbyViewController";
import RoomViewController from "./RoomViewController";
import Text from "../Text";

class GuestRoomViewController extends RoomViewController {
  private static readonly PROMPT_TEXT_FONT_SIZE = 16;

  private promptText: Text;
  private hostLeftRoomAlert: Alert;

  constructor(roomId: string) {
    super(roomId);
    this.promptText = new Text("Waiting for the host to start the game...", {
      fontSize: GuestRoomViewController.PROMPT_TEXT_FONT_SIZE,
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

  protected addEventListeners() {
    super.addEventListeners();
    const socket = Application.shared.socket;
    socket.on("host-left", this.handleSocketHostLeave.bind(this));
  }

  protected removeEventListeners() {
    super.removeEventListeners();
    const socket = Application.shared.socket;
    socket.off("host-left");
  }

  protected update() {
    super.update();
    this.updateTycoonOptionsView();
  }

  private handleSocketHostLeave() {
    this.addChild(this.hostLeftRoomAlert);
  }

  private layoutPromptText() {
    this.promptText.anchor.set(0.5);
    this.promptText.x = Application.WIDTH / 2;
    this.promptText.y = Application.HEIGHT / 2;
  }

  private createHostLeftRoomAlert() {
    const alert = new Alert("The host left the room :(");
    alert.onOk(this.handleHostLeftRoomAlertOk);
    return alert;
  }

  private handleHostLeftRoomAlertOk = () => {
    this.loadViewController(new LobbyViewController());
  };
}

export default GuestRoomViewController;
