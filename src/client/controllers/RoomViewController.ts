import Application from "../Application";
import Button from "../Button";
import Color from "../Color";
import LobbyViewController from "./LobbyViewController";
import Text from "../Text";
import ViewController from "./ViewController";
import Container from "../Container";
import {
  TycoonOptionKey,
  TycoonOptions,
  TycoonUtil,
} from "../../common/Tycoon";
import TycoonViewController from "./TycoonViewController";
import { RoomJson } from "../../common/Room";

class TycoonOptionsView extends Container {
  private tycoonOptions: TycoonOptions;

  private customSettingsText: Text;
  private tycoonOptionTexts: Text[];

  constructor(tycoonOptions: TycoonOptions) {
    super();

    this.tycoonOptions = tycoonOptions;
    this.customSettingsText = new Text("Custom Settings", {
      fill: Color.WHITE,
      fontSize: 16,
    });
    this.tycoonOptionTexts = this.createTycoonOptionTexts();

    this.updateOptionTexts();
    this.layout();
    this.draw();
  }

  private layout() {
    this.layoutOptionTexts();
  }

  private createTycoonOptionTexts() {
    const texts = [];

    const optionKeys = Object.values(TycoonOptionKey);
    optionKeys.forEach(() => {
      texts.push(
        new Text("", {
          fill: Color.WHITE,
          fontSize: 16,
        })
      );
    });

    return texts;
  }

  private layoutOptionTexts() {
    this.tycoonOptionTexts.forEach((text, index) => {
      text.y =
        this.customSettingsText.height +
        Application.spacing(2) +
        Application.spacing(2) * index;
    });
  }

  private draw() {
    this.addChild(this.customSettingsText);
    this.addChild(...this.tycoonOptionTexts);
  }

  public setTycoonOptions(tycoonOptions: TycoonOptions) {
    this.tycoonOptions = tycoonOptions;
    this.updateOptionTexts();
  }

  private updateOptionTexts() {
    const optionKeys = Object.values(TycoonOptionKey);
    optionKeys.forEach((optionKey, index) => {
      const text = this.tycoonOptionTexts[index];
      const checked = this.tycoonOptions[optionKey];
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
    this.roomCapacity = 2;
    this.tycoonOptions = TycoonUtil.createDefaultTycoonOptions();

    this.roomText = new Text(`🏠 Room ${roomId} 🏠`, { fill: Color.WHITE });
    this.numPlayersText = new Text("", { fill: Color.WHITE });
    this.leaveButton = this.createLeaveButton();
    this.tycoonOptionsView = new TycoonOptionsView(this.tycoonOptions);

    this.updateRoomNumPlayersText();
  }

  protected layout() {
    this.layoutRoomText();
    this.layoutNumPeopleText();
    this.layoutLeaveButton();
    this.layoutTycoonOptionsText();
  }

  protected draw() {
    this.addChild(this.roomText);
    this.addChild(this.numPlayersText);
    this.addChild(this.leaveButton);
    this.addChild(this.tycoonOptionsView);
  }

  protected addEventListeners() {
    const socket = Application.shared.socket;
    socket.on(
      "room-status-update",
      this.handleSocketRoomStatusUpdate.bind(this)
    );
    socket.on("start-success", this.handleSocketStartSuccess);
  }

  protected handleSocketRoomStatusUpdate(roomJson: RoomJson) {
    this.roomNumPlayers = roomJson.numPlayers;
    this.tycoonOptions = roomJson.options;
    this.updateRoomNumPlayersText();
  }

  protected removeEventListeners() {
    const socket = Application.shared.socket;
    socket.off("room-status-update");
    socket.off("start-success");
  }

  private updateRoomNumPlayersText() {
    this.numPlayersText.text = `${this.roomNumPlayers}/${this.roomCapacity} 👤`;
    if (this.roomNumPlayers === this.roomCapacity) {
      this.numPlayersText.tint = Color.GREEN;
    } else {
      this.numPlayersText.tint = Color.RED;
    }
  }

  private layoutTycoonOptionsText() {
    this.tycoonOptionsView.x = Application.spacing(3);
    this.tycoonOptionsView.y = Application.spacing(3);
  }

  private layoutRoomText() {
    this.roomText.anchor.set(0.5);
    this.roomText.x = Application.WIDTH / 2;
    this.roomText.y = Application.spacing(5);
  }

  private layoutNumPeopleText() {
    this.numPlayersText.anchor.set(0.5);
    this.numPlayersText.x = Application.WIDTH / 2;
    this.numPlayersText.y =
      Application.HEIGHT - this.numPlayersText.height - Application.spacing(3);
  }

  private layoutLeaveButton() {
    this.leaveButton.x = Application.spacing(3);
    this.leaveButton.y =
      Application.HEIGHT - this.leaveButton.height - Application.spacing(3);
  }

  private createLeaveButton() {
    const button = new Button("leave ❌");
    button.onPointerDown(this.handleLeaveButtonPointerDown.bind(this));
    return button;
  }

  private handleLeaveButtonPointerDown() {
    this.loadViewController(new LobbyViewController());
    const socket = Application.shared.socket;
    socket.emit("leave-room");
  }

  private handleSocketStartSuccess = (tycoonOptions: TycoonOptions) => {
    this.pushViewController(new TycoonViewController(tycoonOptions));
  };
}

export default RoomViewController;
