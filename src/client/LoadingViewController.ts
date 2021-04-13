import * as PIXI from "pixi.js";
import Color from "./Color";
import MenuViewController from "./MenuViewController";
import Text from "./Text";
import ViewController from "./ViewController";
import Application from "./Application";
import Texture from "./Texture";
import Sound from "./Sound";

class LoadingViewController extends ViewController {
  private loadingText: Text;
  private percentageText: Text;

  constructor() {
    super();
    this.loadingText = new Text("Loading...", { fill: Color.WHITE });
    this.percentageText = new Text("", { fill: Color.WHITE });
    this.loadGameAssets();
  }

  protected layout() {
    this.layoutLoadingText();
    this.layoutLoadingIndicator();
  }

  protected draw() {
    this.addChild(this.loadingText);
    this.addChild(this.percentageText);
  }

  protected addEventListeners() {}

  protected removeEventListeners() {}

  private layoutLoadingText() {
    this.loadingText.anchor.set(0.5);
    this.loadingText.x = Application.WIDTH / 2;
    this.loadingText.y = Application.HEIGHT / 2 - Application.spacing(4);
  }

  private layoutLoadingIndicator() {
    this.percentageText.anchor.set(0.5);
    this.percentageText.x = Application.WIDTH / 2;
    this.percentageText.y = Application.HEIGHT / 2 + Application.spacing(4);
  }

  private loadGameAssets() {
    const loader = PIXI.Loader.shared;
    loader.add(Texture.getFilePaths());
    loader.add(Sound.getFilePaths());
    loader.onProgress.add(this.handleLoaderOnProgress);
    loader.load(this.handleLoaderOnComplete);
  }

  private handleLoaderOnProgress = (loader: { progress: number }) => {
    this.percentageText.text = `${Math.round(loader.progress)}%`;
  };

  private handleLoaderOnComplete = () => {
    this.loadViewController(new MenuViewController());
  };
}

export default LoadingViewController;
