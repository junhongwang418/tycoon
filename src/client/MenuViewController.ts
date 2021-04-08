import App from "./App";
import Button from "./Button";
import Color from "./Color";
import RoomSelectionViewController from "./RoomSelectionViewController";
import Text from "./Text";
import ViewController from "./ViewController";
import PIXISound from "pixi-sound";

class MenuViewController extends ViewController {
  constructor() {
    super();
    this.draw();
  }

  private draw() {
    this.drawTitleText();
    this.drawPlayButton();
  }

  private drawTitleText() {
    const text = new Text("🃏 Tycoon 🃏", { fill: Color.WHITE });
    text.anchor.set(0.5);
    text.x = App.WIDTH / 2;
    text.y = App.HEIGHT / 2 - 100;
    this.addChild(text);
  }

  private drawPlayButton() {
    const button = new Button("play");
    button.x = App.WIDTH / 2 - button.width / 2;
    button.y = App.HEIGHT / 2;
    button.on("pointerdown", this.handlePlayButtonClick);
    this.addChild(button);
  }

  private handlePlayButtonClick = () => {
    this.loadViewController(new RoomSelectionViewController());
    const sound = PIXISound.Sound.from("click1.ogg");
    sound.play();
  };
}

export default MenuViewController;
