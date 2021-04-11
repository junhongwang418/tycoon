import Application from "./Application";
import Button from "./Button";
import Color from "./Color";
import LobbyViewController from "./LobbyViewController";
import Text from "./Text";
import ViewController from "./ViewController";

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
    text.x = Application.WIDTH / 2;
    text.y = Application.HEIGHT / 2 - Application.spacing(4);
    this.addChild(text);
  }

  private drawPlayButton() {
    const button = new Button("play");
    button.setCenterAsOrigin();
    button.x = Application.WIDTH / 2;
    button.y = Application.HEIGHT / 2 + Application.spacing(4);
    button.onPointerDown(this.handlePlayButtonClick);
    this.addChild(button);
  }

  private handlePlayButtonClick = () => {
    this.loadViewController(new LobbyViewController());
  };
}

export default MenuViewController;
