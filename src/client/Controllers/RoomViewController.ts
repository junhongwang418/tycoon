import Application from "../Application";
import Button from "../Button";
import Color from "../Color";
import LobbyViewController from "./LobbyViewController";
import Text from "../Text";
import ViewController from "./ViewController";
import Container from "../Container";
import * as PIXI from "pixi.js";
import {
  TycoonOptionKey,
  TycoonOptions,
  DEFAULT_TYCOON_OPTIONS,
} from "../../common/Tycoon";
import TycoonViewController from "./TycoonViewController";
import { RoomJson } from "../../common/Room";

class TycoonOptionsView extends Container {
  private tycoonOptions: TycoonOptions;

  private customSettingsText: Text;
  private optionTexts: Text[];

  constructor(tycoonOptions: TycoonOptions) {
    super();

    this.tycoonOptions = tycoonOptions;

    const textStyle: Partial<PIXI.ITextStyle> = {
      fill: Color.WHITE,
      fontSize: 16,
    };

    this.customSettingsText = new Text("Custom Settings", textStyle);

    this.optionTexts = [];

    const optionKeys = Object.values(TycoonOptionKey);
    optionKeys.forEach(() => {
      this.optionTexts.push(new Text("", textStyle));
    });
    this.updateOptionTexts();

    this.layout();
    this.draw();
  }

  private layout() {
    this.layoutOptionTexts();
  }

  private layoutOptionTexts() {
    this.optionTexts.forEach((text, index) => {
      text.y =
        this.customSettingsText.height +
        Application.spacing(2) +
        Application.spacing(2) * index;
    });
  }

  private draw() {
    this.addChild(this.customSettingsText);
    this.addChild(...this.optionTexts);
  }

  public setTycoonOptions(tycoonOptions: TycoonOptions) {
    this.tycoonOptions = tycoonOptions;
    this.updateOptionTexts();
  }

  private updateOptionTexts() {
    const optionKeys = Object.values(TycoonOptionKey);
    optionKeys.forEach((optionKey, index) => {
      const text = this.optionTexts[index];
      const checked = this.tycoonOptions[optionKey];
      text.text = `${optionKey.toString()}: ${checked ? "yes" : "no"}`;
    });
  }
}

class RoomViewController extends ViewController {
  protected roomId: string;
  protected numPeople: number;
  protected roomCapacity: number;
  protected tycoonOptions: TycoonOptions;

  protected labelText: Text;
  protected numPeopleText: Text;
  protected leaveButton: Button;
  protected tycoonOptionsText: TycoonOptionsView;

  constructor(roomId: string) {
    super();
    this.roomId = roomId;
    this.numPeople = 1;
    this.roomCapacity = 2;
    this.tycoonOptions = DEFAULT_TYCOON_OPTIONS;

    this.labelText = new Text(`🏠 Room ${roomId} 🏠`, { fill: Color.WHITE });
    this.numPeopleText = new Text("", { fill: Color.WHITE });
    this.leaveButton = this.createLeaveButton();
    this.tycoonOptionsText = new TycoonOptionsView(this.tycoonOptions);

    this.updateNumPeopleText();
  }

  protected layout() {
    this.layoutLabelText();
    this.layoutNumPeopleText();
    this.layoutLeaveButton();
    this.layoutTycoonOptionsText();
  }

  protected draw() {
    this.drawLabelText();
    this.drawNumPeopleText();
    this.drawLeaveButton();
    this.drawTycoonOptionsText();
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
    this.numPeople = roomJson.numSockets;
    this.tycoonOptions = roomJson.options;
    this.updateNumPeopleText();
  }

  protected removeEventListeners() {
    const socket = Application.shared.socket;
    socket.off(
      "room-status-update",
      this.handleSocketRoomStatusUpdate.bind(this)
    );
    socket.off("start-success", this.handleSocketStartSuccess);
  }

  private updateNumPeopleText() {
    this.numPeopleText.text = `${this.numPeople}/${this.roomCapacity} 👤`;
    if (this.numPeople === this.roomCapacity) {
      this.numPeopleText.tint = Color.GREEN;
    } else {
      this.numPeopleText.tint = Color.RED;
    }
  }

  private layoutTycoonOptionsText() {
    this.tycoonOptionsText.x = Application.spacing(3);
    this.tycoonOptionsText.y = Application.spacing(3);
  }

  private drawTycoonOptionsText() {
    this.addChild(this.tycoonOptionsText);
  }

  private drawLabelText() {
    this.addChild(this.labelText);
  }

  private layoutLabelText() {
    this.labelText.anchor.set(0.5);
    this.labelText.x = Application.WIDTH / 2;
    this.labelText.y = Application.spacing(5);
  }

  private drawNumPeopleText() {
    this.addChild(this.numPeopleText);
  }

  private layoutNumPeopleText() {
    this.numPeopleText.anchor.set(0.5);
    this.numPeopleText.x = Application.WIDTH / 2;
    this.numPeopleText.y =
      Application.HEIGHT - this.numPeopleText.height - Application.spacing(3);
  }

  private drawLeaveButton() {
    this.addChild(this.leaveButton);
  }

  private layoutLeaveButton() {
    this.leaveButton.x = Application.spacing(3);
    this.leaveButton.y =
      Application.HEIGHT - this.leaveButton.height - Application.spacing(3);
  }

  private createLeaveButton() {
    const button = new Button("leave ❌");
    button.on("pointerdown", this.handleLeaveButtonPointerDown);
    return button;
  }

  private handleLeaveButtonPointerDown = () => {
    this.loadViewController(new LobbyViewController());
    const socket = Application.shared.socket;
    socket.emit("leave-room");
  };

  private handleSocketStartSuccess = (tycoonOptions: TycoonOptions) => {
    this.loadViewController(new TycoonViewController(tycoonOptions));
  };
}

export default RoomViewController;
