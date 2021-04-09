import * as PIXI from "pixi.js";
import Application from "./Application";
import Color from "./Color";
import RoomViewController from "./RoomViewController";
import Text from "./Text";
import ViewController from "./ViewController";
import PIXISound from "pixi-sound";
import { NUM_ROOMS } from "../common/Lobby";
import { RoomJson } from "../server/Room";

class Room extends PIXI.Container {
  public static readonly WIDTH = 500;
  public static readonly HEIGHT = 100;

  private index: number;
  private frame: PIXI.Graphics;
  private numPeople: number;
  private numPeopleText: Text;

  constructor(index: number) {
    super();

    this.index = index;
    this.frame = new PIXI.Graphics();
    this.numPeople = 0;
    this.numPeopleText = new Text("", { fill: Color.WHITE });
    this.setNumPeople(0);

    this.draw();
    this.enableInteraction();
    this.addEventListeners();
  }

  public setNumPeople(numPeople: number) {
    this.numPeople = numPeople;
    this.updateNumPeopleText();
  }

  public getNumPeople() {
    return this.numPeople;
  }

  private updateNumPeopleText() {
    this.numPeopleText.text = `${this.numPeople} / 2 👤`;
  }

  private draw() {
    this.drawFrame();
    this.drawNumPeopleText();
    this.drawLabelText();
  }

  private drawLabelText() {
    const labelText = new Text(`🏠 Room ${this.index}`, { fill: Color.WHITE });
    labelText.anchor.set(0.5);
    labelText.x = 20 + labelText.width / 2;
    labelText.y = Room.HEIGHT / 2;
    this.addChild(labelText);
  }

  private addEventListeners() {
    this.on("pointerover", this.handlePointerOver);
    this.on("pointerout", this.handlePointerOut);
  }

  private handlePointerOver = () => {
    this.frame.tint = Color.BLUE;
  };

  private handlePointerOut = () => {
    this.frame.tint = Color.WHITE;
  };

  private drawFrame() {
    this.frame.lineStyle(1, Color.WHITE);
    this.frame.beginFill(Color.BLACK);
    this.frame.drawRect(0, 0, Room.WIDTH, Room.HEIGHT);
    this.frame.endFill();
    this.addChild(this.frame);
  }

  private drawNumPeopleText() {
    this.numPeopleText.anchor.set(0.5);
    this.numPeopleText.x = 400;
    this.numPeopleText.y = Room.HEIGHT / 2;
    this.addChild(this.numPeopleText);
  }

  private defineHitArea() {
    this.hitArea = new PIXI.Rectangle(0, 0, Room.WIDTH, Room.HEIGHT);
  }

  private enableInteraction() {
    this.interactive = true;
    this.defineHitArea();
  }
}

class LobbyViewController extends ViewController {
  private rooms: Room[];

  constructor() {
    super();

    this.rooms = this.createRooms();
    this.drawPromptText();
    this.drawRooms();
    this.addEventListeners();
  }

  private createRooms() {
    const rooms = [];
    for (let i = 0; i < NUM_ROOMS; i++) {
      rooms.push(new Room(i));
    }
    return rooms;
  }

  private drawRooms() {
    for (let i = 0; i < this.rooms.length; i++) {
      const room = this.rooms[i];
      room.x = 400;
      room.y = 200 + 120 * i;
      room.on("pointerdown", () => {
        if (room.getNumPeople() < 2) {
          const socket = Application.shared.socket;
          socket.emit("enter-room", i);
        }
        const sound = PIXISound.Sound.from("click1.ogg");
        sound.play();
      });
      this.addChild(room);
    }
  }

  private addEventListeners() {
    const socket = Application.shared.socket;
    socket.on("room-status", this.handleSocketRoomStatus);
    socket.on("enter-room", this.handleSocketEnterRoom);
  }

  private handleSocketRoomStatus = (roomJsons: RoomJson[]) => {
    for (let i = 0; i < this.rooms.length; i++) {
      this.rooms[i].setNumPeople(roomJsons[i].numPlayers);
    }
  };

  private handleSocketEnterRoom = (roomIndex: number) => {
    this.cleanup();
    this.loadViewController(new RoomViewController(roomIndex));
  };

  private cleanup() {
    const socket = Application.shared.socket;
    socket.off("room-status");
    socket.off("enter-room");
  }

  private drawPromptText() {
    const text = new Text("Select A Room To Join 🚪", { fill: Color.WHITE });
    text.anchor.set(0.5);
    text.x = Application.WIDTH / 2;
    text.y = 100;
    this.addChild(text);
  }
}

export default LobbyViewController;
