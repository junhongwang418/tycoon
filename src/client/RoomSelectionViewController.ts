import * as PIXI from "pixi.js";
import App from "./App";
import Color from "./Color";
import RoomViewController from "./RoomViewController";
import Text from "./Text";
import ViewController from "./ViewController";
import PIXISound from "pixi-sound";

class Room extends PIXI.Container {
  public static readonly WIDTH = 500;
  public static readonly HEIGHT = 100;

  private number: number;
  private frame: PIXI.Graphics;
  private numPeople: number;
  private numPeopleText: Text;

  constructor(number: number) {
    super();

    this.number = number;
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
    const labelText = new Text(`🏠 Room ${this.number}`, { fill: Color.WHITE });
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

class RoomSelectionViewController extends ViewController {
  private socket: SocketIOClient.Socket;
  private rooms: Room[];

  constructor() {
    super();
    this.socket = App.shared.socket;
    this.rooms = [];
    this.drawPromptText();

    this.socket.on("rooms", (numPeoples: number[]) => {
      if (this.rooms.length === 0) {
        for (let i = 0; i < numPeoples.length; i++) {
          this.rooms.push(new Room(i));
        }
        this.drawRooms();
      }

      for (let i = 0; i < this.rooms.length; i++) {
        this.rooms[i].setNumPeople(numPeoples[i]);
      }
    });

    this.socket.on("enterroom-success", (roomNumber) => {
      this.cleanup();
      this.loadViewController(new RoomViewController(roomNumber));
    });
  }

  private drawRooms() {
    for (let i = 0; i < this.rooms.length; i++) {
      const room = this.rooms[i];
      room.x = 400;
      room.y = 200 + 120 * i;
      room.on("pointerdown", () => {
        if (room.getNumPeople() < 2) {
          this.socket.emit("enterroom", i);
        }
        const sound = PIXISound.Sound.from("click1.ogg");
        sound.play();
      });
      this.addChild(room);
    }
  }

  private cleanup() {
    this.socket.off("rooms");
    this.socket.off("enterroom-success");
  }

  private drawPromptText() {
    const text = new Text("Select A Room To Join 🚪", { fill: Color.WHITE });
    text.anchor.set(0.5);
    text.x = App.WIDTH / 2;
    text.y = 100;
    this.addChild(text);
  }
}

export default RoomSelectionViewController;
