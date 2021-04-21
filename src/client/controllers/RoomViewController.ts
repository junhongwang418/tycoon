import Application from "../Application";
import Button from "../views/Button";
import Color from "../Color";
import LobbyViewController from "./LobbyViewController";
import Text from "../views/Text";
import ViewController from "./ViewController";
import { TycoonOptions, TycoonUtil } from "../../common/Tycoon";
import TycoonViewController from "./TycoonViewController";
import { RoomJson } from "../../common/Room";
import Layout from "../Layout";
import TycoonOptionsView from "../views/TycoonOptionsView";

class RoomViewController extends ViewController {
  protected roomId: string;
  protected roomNumPlayers: number;
  protected roomCapacity: number;
  protected tycoonOptions: TycoonOptions;

  protected roomText: Text;
  protected numPlayersText: Text;
  protected leaveButton: Button;
  protected tycoonOptionsView: TycoonOptionsView;

  constructor(roomJson: RoomJson) {
    super();

    const { id, capacity } = roomJson;

    this.roomId = id;
    this.roomNumPlayers = 1;
    this.roomCapacity = capacity;

    this.roomText = new Text(`🏠 Room ${id} 🏠`);
    this.numPlayersText = new Text("");
    this.leaveButton = this.createLeaveButton();
    this.tycoonOptions = TycoonUtil.createDefaultTycoonOptions();
    this.tycoonOptionsView = new TycoonOptionsView(this.tycoonOptions);

    this.updateRoomNumPlayersText();
  }

  protected layout() {
    super.layout();
    this.layoutRoomText();
    this.layoutNumPlayersText();
    this.layoutLeaveButton();
    this.layoutTycoonOptionsText();
  }

  protected draw() {
    super.draw();
    this.addView(this.roomText);
    this.addView(this.numPlayersText);
    this.addView(this.leaveButton);
    this.addView(this.tycoonOptionsView);
  }

  public addEventListeners() {
    super.addEventListeners();
    const socket = Application.shared.socket;
    socket.on("room-status-update", this.handleSocketRoomStatusUpdate);
    socket.on("room-start-success", this.handleSocketStartSuccess);
  }

  public removeEventListeners() {
    super.removeEventListeners();
    const socket = Application.shared.socket;
    socket.off("room-status-update", this.handleSocketRoomStatusUpdate);
    socket.off("room-start-success", this.handleSocketStartSuccess);
  }

  protected update() {
    this.updateRoomNumPlayersText();
  }

  protected updateTycoonOptionsView() {
    this.tycoonOptionsView.updateTycoonOptionTexts(this.tycoonOptions);
  }

  private handleSocketRoomStatusUpdate = (roomJson: RoomJson) => {
    this.roomNumPlayers = roomJson.numPlayers;
    this.tycoonOptions = roomJson.options;
    this.update();
  };

  private updateRoomNumPlayersText() {
    this.numPlayersText.updateText(
      `${this.roomNumPlayers}/${this.roomCapacity} 👤`
    );

    if (this.roomNumPlayers === this.roomCapacity) {
      this.numPlayersText.setTint(Color.Green);
    } else {
      this.numPlayersText.setTint(Color.Red);
    }
  }

  private layoutTycoonOptionsText() {
    this.tycoonOptionsView.x = Layout.spacing(3);
    this.tycoonOptionsView.y = Layout.spacing(3);
  }

  private layoutRoomText() {
    this.roomText.setCenterAsOrigin();
    this.roomText.x = Application.WIDTH / 2;
    this.roomText.y = Layout.spacing(5);
  }

  private layoutNumPlayersText() {
    this.numPlayersText.setCenterAsOrigin();
    this.numPlayersText.x = Application.WIDTH / 2;
    this.numPlayersText.y =
      Application.HEIGHT -
      this.numPlayersText.getTextSize().height / 2 -
      Layout.spacing(3);
  }

  private layoutLeaveButton() {
    this.leaveButton.x = Layout.spacing(3);
    this.leaveButton.y =
      Application.HEIGHT -
      this.leaveButton.getSize().height -
      Layout.spacing(3);
  }

  private createLeaveButton() {
    const button = new Button("← Leave");
    button.onPointerDown(this.handleLeaveButtonPointerDown);
    return button;
  }

  private handleLeaveButtonPointerDown = () => {
    this.loadViewController(new LobbyViewController());
    const socket = Application.shared.socket;
    socket.emit("room-leave");
  };

  private handleSocketStartSuccess = (tycoonOptions: TycoonOptions) => {
    this.pushViewController(
      new TycoonViewController(this.roomCapacity, tycoonOptions)
    );
  };
}

export default RoomViewController;
