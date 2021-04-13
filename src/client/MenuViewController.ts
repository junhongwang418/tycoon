import Application from "./Application";
import Button from "./Button";
import Color from "./Color";
import LobbyViewController from "./LobbyViewController";
import Text from "./Text";
import ViewController from "./ViewController";

class MenuViewController extends ViewController {
  private titleText: Text;
  private playButton: Button;
  private howToPlayButton: Button;

  constructor() {
    super();
    this.titleText = new Text("🃏 Tycoon 🃏", { fill: Color.WHITE });
    this.playButton = this.createPlayButton();
    this.howToPlayButton = this.createHowToPlayButton();
  }

  protected layout() {
    this.layoutTitleText();
    this.layoutPlayButton();
    this.layoutHowToPlayButton();
  }

  protected draw() {
    this.addChild(this.titleText);
    this.addChild(this.playButton);
    this.addChild(this.howToPlayButton);
  }

  protected addEventListeners() {}

  protected removeEventListeners() {}

  private createPlayButton() {
    const button = new Button("Play");
    button.onPointerDown(this.handlePlayButtonPointerDown);
    return button;
  }

  private createHowToPlayButton() {
    const button = new Button("How to Play");
    button.disable();
    return button;
  }

  private handlePlayButtonPointerDown = () => {
    this.loadViewController(new LobbyViewController());
  };

  private layoutPlayButton() {
    this.playButton.setCenterAsOrigin();
    this.playButton.x = Application.WIDTH / 2;
    this.playButton.y = Application.HEIGHT / 2 - Application.spacing(5);
  }

  private layoutHowToPlayButton() {
    this.howToPlayButton.setCenterAsOrigin();
    this.howToPlayButton.x = Application.WIDTH / 2;
    this.howToPlayButton.y = Application.HEIGHT / 2 + Application.spacing(5);
  }

  private layoutTitleText() {
    this.titleText.anchor.set(0.5);
    this.titleText.x = Application.WIDTH / 2;
    this.titleText.y = Application.HEIGHT / 4;
  }
}

export default MenuViewController;
