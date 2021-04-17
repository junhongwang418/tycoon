import Alert from "../views/Alert";
import Application from "../Application";
import RoomViewController from "./RoomViewController";
import LobbyViewController from "./LobbyViewController";
import Text from "../views/Text";

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
    this.addView(this.promptText);
  }

  public addEventListeners() {
    super.addEventListeners();
    const socket = Application.shared.socket;
    socket.on("room-host-leave", this.handleSocketHostLeave);
  }

  public removeEventListeners() {
    super.removeEventListeners();
    const socket = Application.shared.socket;
    socket.off("room-host-leave", this.handleSocketHostLeave);
  }

  protected update() {
    super.update();
    this.updateTycoonOptionsView();
  }

  private handleSocketHostLeave = () => {
    this.addView(this.hostLeftRoomAlert);
  };

  private layoutPromptText() {
    this.promptText.setCenterAsOrigin();
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
