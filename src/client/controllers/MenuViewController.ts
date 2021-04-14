import Application from "../Application";
import Button from "../Button";
import Color from "../Color";
import LobbyViewController from "./LobbyViewController";
import Text from "../Text";
import ViewController from "./ViewController";

class MenuViewController extends ViewController {
  private titleText: Text;
  private playButton: Button;

  constructor() {
    super();
    this.titleText = new Text("🃏 Tycoon 🃏", { fill: Color.WHITE });
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

  protected addEventListeners() {}

  protected removeEventListeners() {}

  private createPlayButton() {
    const button = new Button("Play");
    button.onPointerDown(this.handlePlayButtonPointerDown.bind(this));
    return button;
  }

  private handlePlayButtonPointerDown() {
    this.loadViewController(new LobbyViewController());
  }

  private layoutPlayButton() {
    this.playButton.setCenterAsOrigin();
    this.playButton.x = Application.WIDTH / 2;
    this.playButton.y = Application.HEIGHT / 2 + Application.spacing(5);
  }

  private layoutTitleText() {
    this.titleText.anchor.set(0.5);
    this.titleText.x = Application.WIDTH / 2;
    this.titleText.y = Application.HEIGHT / 2 - Application.spacing(5);
  }
}

export default MenuViewController;