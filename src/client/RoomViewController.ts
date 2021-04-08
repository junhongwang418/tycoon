import App from "./App";
import Button from "./Button";
import Color from "./Color";
import RoomSelectionViewController from "./RoomSelectionViewController";
import Text from "./Text";
import TycoonViewController from "./TycoonViewController";
import ViewController from "./ViewController";
import PIXISound from "pixi-sound";

class RoomViewController extends ViewController {
  private socket: SocketIOClient.Socket;
  private roomNumber: number;

  constructor(roomNumber: number) {
    super();
    this.roomNumber = roomNumber;
    this.socket = App.shared.socket;

    this.addEventListeners();
    this.draw();
  }

  private draw() {
    this.drawLabelText();
    this.drawPrompt();
    this.drawLeaveButton();
  }

  private addEventListeners() {
    this.socket.on("rooms", (roomPeoples: number[]) => {
      if (roomPeoples[this.roomNumber] === 2) {
        this.cleanup();
        this.loadViewController(new TycoonViewController());
        this.socket.emit("ready");
      }
    });
  }

  private drawLabelText() {
    const text = new Text(`🏠 Room ${this.roomNumber} 🏠 `, {
      fill: Color.WHITE,
    });
    text.anchor.set(0.5);
    text.x = App.WIDTH / 2;
    text.y = 100;
    this.addChild(text);
  }

  private drawPrompt() {
    const text = new Text("waiting for someone to enter the room...", {
      fill: Color.WHITE,
    });
    text.anchor.set(0.5);
    text.x = App.WIDTH / 2;
    text.y = 300;
    this.addChild(text);
  }

  private drawLeaveButton() {
    const button = new Button("leave");
    button.x = App.WIDTH / 2 - button.width / 2;
    button.y = 400;
    button.on("pointerdown", () => {
      this.cleanup();
      this.loadViewController(new RoomSelectionViewController());
      this.socket.emit("leaveroom", this.roomNumber);

      const sound = PIXISound.Sound.from("click1.ogg");
      sound.play();
    });
    this.addChild(button);
  }

  private cleanup() {
    this.socket.off("rooms");
  }
}

export default RoomViewController;
