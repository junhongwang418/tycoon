import Application from "../Application";
import Button from "../Button";
import LobbyViewController from "./LobbyViewController";
import Text from "../Text";
import ViewController from "./ViewController";
import Layout from "../Layout";

class MenuViewController extends ViewController {
  private titleText: Text;
  private playButton: Button;

  constructor() {
    super();
    this.titleText = new Text("🃏 Tycoon 🃏");
    this.playButton = this.createPlayButton();
  }

  protected layout() {
    this.layoutTitleText();
    this.layoutPlayButton();
  }

  protected draw() {
    this.addChild(this.titleText);
    this.addChild(this.playButton);
  }

  private createPlayButton() {
    const button = new Button("Play");
    button.onPointerDown(this.handlePlayButtonPointerDown);
    return button;
  }

  private handlePlayButtonPointerDown = () => {
    this.pushViewController(new LobbyViewController());
  };

  private layoutPlayButton() {
    this.playButton.setCenterAsOrigin();
    this.playButton.x = Application.WIDTH / 2;
    this.playButton.y = Application.HEIGHT / 2 + Layout.spacing(5);
  }

  private layoutTitleText() {
    this.titleText.anchor.set(0.5);
    this.titleText.x = Application.WIDTH / 2;
    this.titleText.y = Application.HEIGHT / 2 - Layout.spacing(5);
  }
}

export default MenuViewController;
