import Application from "../Application";
import Button from "../Button";
import Color from "../Color";
import LobbyViewController from "./LobbyViewController";
import Text from "../Text";
import ViewController from "./ViewController";
import View from "../View";
import {
  TycoonOptionKey,
  TycoonOptions,
  TycoonUtil,
} from "../../common/Tycoon";
import TycoonViewController from "./TycoonViewController";
import { DEFAULT_ROOM_CAPACITY, RoomJson } from "../../common/Room";
import Layout from "../Layout";

class TycoonOptionsView extends View {
  private static readonly FONT_SIZE = 16;

  private customSettingsText: Text;
  private tycoonOptionTexts: Text[];

  constructor(tycoonOptions: TycoonOptions) {
    super();
    this.customSettingsText = new Text("Custom Settings", {
      fontSize: TycoonOptionsView.FONT_SIZE,
    });
    this.tycoonOptionTexts = this.createTycoonOptionTexts();
    this.updateTycoonOptionTexts(tycoonOptions);

    this.layout();
    this.draw();
  }

  private layout() {
    this.layoutOptionTexts();
  }

  private draw() {
    this.addChild(this.customSettingsText);
    this.addChild(...this.tycoonOptionTexts);
  }

  private createTycoonOptionTexts() {
    const texts = [];
    const optionKeys = Object.values(TycoonOptionKey);
    optionKeys.forEach(() => {
      texts.push(new Text("", { fontSize: TycoonOptionsView.FONT_SIZE }));
    });
    return texts;
  }

  private layoutOptionTexts() {
    this.tycoonOptionTexts.forEach((text, index) => {
      text.y =
        this.customSettingsText.height +
        Layout.spacing(2) +
        Layout.spacing(2) * index;
    });
  }

  public updateTycoonOptionTexts(tycoonOptions: TycoonOptions) {
    const optionKeys = Object.values(TycoonOptionKey);
    optionKeys.forEach((optionKey, index) => {
      const text = this.tycoonOptionTexts[index];
      const checked = tycoonOptions[optionKey];
      text.text = `${optionKey.toString()}: ${checked ? "yes" : "no"}`;
    });
  }
}

class RoomViewController extends ViewController {
  protected roomId: string;
  protected roomNumPlayers: number;
  protected roomCapacity: number;
  protected tycoonOptions: TycoonOptions;

  protected roomText: Text;
  protected numPlayersText: Text;
  protected leaveButton: Button;
  protected tycoonOptionsView: TycoonOptionsView;

  constructor(roomId: string) {
    super();
    this.roomId = roomId;
    this.roomNumPlayers = 1;
    this.roomCapacity = DEFAULT_ROOM_CAPACITY;

    this.roomText = new Text(`🏠 Room ${roomId} 🏠`);
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
    this.addChild(this.roomText);
    this.addChild(this.numPlayersText);
    this.addChild(this.leaveButton);
    this.addChild(this.tycoonOptionsView);
  }

  protected addEventListeners() {
    super.addEventListeners();
    const socket = Application.shared.socket;
    socket.on("room-status-update", this.handleSocketRoomStatusUpdate);
    socket.on("start-success", this.handleSocketStartSuccess);
  }

  protected removeEventListeners() {
    super.removeEventListeners();
    const socket = Application.shared.socket;
    socket.off("room-status-update", this.handleSocketRoomStatusUpdate);
    socket.off("start-success", this.handleSocketStartSuccess);
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
    this.numPlayersText.text = `${this.roomNumPlayers}/${this.roomCapacity} 👤`;
    if (this.roomNumPlayers === this.roomCapacity) {
      this.numPlayersText.tint = Color.Green;
    } else {
      this.numPlayersText.tint = Color.Red;
    }
  }

  private layoutTycoonOptionsText() {
    this.tycoonOptionsView.x = Layout.spacing(3);
    this.tycoonOptionsView.y = Layout.spacing(3);
  }

  private layoutRoomText() {
    this.roomText.anchor.set(0.5);
    this.roomText.x = Application.WIDTH / 2;
    this.roomText.y = Layout.spacing(5);
  }

  private layoutNumPlayersText() {
    this.numPlayersText.anchor.set(0.5);
    this.numPlayersText.x = Application.WIDTH / 2;
    this.numPlayersText.y =
      Application.HEIGHT - this.numPlayersText.height - Layout.spacing(3);
  }

  private layoutLeaveButton() {
    this.leaveButton.x = Layout.spacing(3);
    this.leaveButton.y =
      Application.HEIGHT - this.leaveButton.height - Layout.spacing(3);
  }

  private createLeaveButton() {
    const button = new Button("← Leave");
    button.onPointerDown(this.handleLeaveButtonPointerDown);
    return button;
  }

  private handleLeaveButtonPointerDown = () => {
    this.loadViewController(new LobbyViewController());
    const socket = Application.shared.socket;
    socket.emit("leave-room");
  };

  private handleSocketStartSuccess = (tycoonOptions: TycoonOptions) => {
    this.pushViewController(new TycoonViewController(tycoonOptions));
  };
}

export default RoomViewController;
