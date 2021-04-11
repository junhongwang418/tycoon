import * as PIXI from "pixi.js";
import Application from "./Application";
import Color from "./Color";
import RoomViewController from "./RoomViewController";
import Text from "./Text";
import ViewController from "./ViewController";
import { NUM_ROOMS } from "../common/Lobby";
import { RoomJson } from "../server/Room";
import Button from "./Button";

class RoomButton extends Button {
  private id: number;
  private numPeople: number;

  constructor(id: number) {
    super(RoomButton.createRoomButtonText(id, 0));
    this.id = id;
    this.numPeople = 0;
  }

  public setNumPeople(numPeople: number) {
    this.numPeople = numPeople;
    this.updateText(RoomButton.createRoomButtonText(this.id, numPeople));
  }

  public getNumPeople() {
    return this.numPeople;
  }

  private static createRoomButtonText(id: number, numPeople: number) {
    return `🏠 Room ${id}     ${numPeople}/2 👤`;
  }
}

class LobbyViewController extends ViewController {
  private promptText: Text;
  private roomButtons: RoomButton[];

  constructor() {
    super();
    this.promptText = new Text("Select A Room To Join 🚪", {
      fill: Color.WHITE,
    });
    this.roomButtons = this.createRoomButtons();

    this.layout();
    this.draw();

    this.addEventListeners();
  }

  private createRoomButtons() {
    const roomButtons = [];
    for (let i = 0; i < NUM_ROOMS; i++) {
      const button = new RoomButton(i);
      roomButtons.push(button);
      button.onPointerDown(() => {
        if (button.getNumPeople() < 2) {
          const socket = Application.shared.socket;
          socket.emit("enter-room", i);
        }
      });
    }
    return roomButtons;
  }

  private layoutRoomButtons() {
    for (let i = 0; i < this.roomButtons.length; i++) {
      const button = this.roomButtons[i];
      button.setCenterAsOrigin();
      button.x = Application.WIDTH / 2;
      button.y = 200 + 60 * i;
    }
  }

  private drawRoomButtons() {
    this.roomButtons.forEach((button) => this.addChild(button));
  }

  private addEventListeners() {
    const socket = Application.shared.socket;
    socket.on("rooms-status", this.handleSocketRoomsStatus);
    socket.on("enter-room", this.handleSocketEnterRoom);
  }

  private handleSocketRoomsStatus = (roomJsons: RoomJson[]) => {
    for (let i = 0; i < this.roomButtons.length; i++) {
      const numPlayers = roomJsons[i].numPlayers;
      this.roomButtons[i].setNumPeople(numPlayers);
      if (numPlayers === 2) {
        this.roomButtons[i].disable();
      } else {
        this.roomButtons[i].enable();
      }
    }
  };

  private handleSocketEnterRoom = () => {
    this.loadViewController(new RoomViewController());
  };

  protected cleanUp() {
    super.cleanUp();
    const socket = Application.shared.socket;
    socket.off("rooms-status");
    socket.off("enter-room");
  }

  private drawPromptText() {
    this.addChild(this.promptText);
  }

  private draw() {
    this.drawPromptText();
    this.drawRoomButtons();
  }

  private layoutPromptText() {
    this.promptText.anchor.set(0.5);
    this.promptText.x = Application.WIDTH / 2;
    this.promptText.y = 100;
  }

  private layout() {
    this.layoutPromptText();
    this.layoutRoomButtons();
  }
}

export default LobbyViewController;
