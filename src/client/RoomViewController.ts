import Application from "./Application";
import Button from "./Button";
import Color from "./Color";
import LobbyViewController from "./LobbyViewController";
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
    this.socket = Application.shared.socket;

    this.addEventListeners();
    this.draw();
  }

  private draw() {
    this.drawLabelText();
    this.drawPrompt();
    this.drawLeaveButton();
  }

  private addEventListeners() {
    this.socket.on("start-game", () => {
      this.cleanup();
      this.loadViewController(new TycoonViewController());
    });
  }

  private drawLabelText() {
    const text = new Text(`🏠 Room ${this.roomNumber} 🏠 `, {
      fill: Color.WHITE,
    });
    text.anchor.set(0.5);
    text.x = Application.WIDTH / 2;
    text.y = 100;
    this.addChild(text);
  }

  private drawPrompt() {
    const text = new Text("waiting for someone to enter the room...", {
      fill: Color.WHITE,
    });
    text.anchor.set(0.5);
    text.x = Application.WIDTH / 2;
    text.y = 300;
    this.addChild(text);
  }

  private drawLeaveButton() {
    const button = new Button("leave");
    button.x = Application.WIDTH / 2 - button.width / 2;
    button.y = 400;
    button.once("pointerdown", this.handleLeaveButtonPointerDown);
    this.addChild(button);
  }

  private handleLeaveButtonPointerDown = () => {
    this.cleanup();
    this.loadViewController(new LobbyViewController());
    this.socket.emit("leave-room");
    const sound = PIXISound.Sound.from("click1.ogg");
    sound.play();
  };

  private cleanup() {
    this.socket.off("start-game");
  }
}

export default RoomViewController;
