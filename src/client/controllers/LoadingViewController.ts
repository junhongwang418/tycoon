import * as PIXI from "pixi.js";
import MenuViewController from "./MenuViewController";
import Text from "../Text";
import ViewController from "./ViewController";
import Application from "../Application";
import Sound from "../Sound";
import Layout from "../Layout";

class LoadingViewController extends ViewController {
  private loadingText: Text;
  private percentageText: Text;

  constructor() {
    super();
    this.loadingText = new Text("Loading...");
    this.percentageText = new Text("");
    this.loadGameAssets();
  }

  protected layout() {
    super.layout();
    this.layoutLoadingText();
    this.layoutPercentageText();
  }

  protected draw() {
    super.draw();
    this.addChild(this.loadingText);
    this.addChild(this.percentageText);
  }

  private layoutLoadingText() {
    this.loadingText.anchor.set(0.5);
    this.loadingText.x = Application.WIDTH / 2;
    this.loadingText.y = Application.HEIGHT / 2 - Layout.spacing(4);
  }

  private layoutPercentageText() {
    this.percentageText.anchor.set(0.5);
    this.percentageText.x = Application.WIDTH / 2;
    this.percentageText.y = Application.HEIGHT / 2 + Layout.spacing(4);
  }

  private loadGameAssets() {
    const loader = PIXI.Loader.shared;
    loader.add(Sound.getFilePaths());
    loader.onProgress.add(this.handleLoaderProgress.bind(this));
    loader.load(this.handleLoaderComplete.bind(this));
  }

  private handleLoaderProgress(loader: { progress: number }) {
    this.percentageText.text = `${Math.round(loader.progress)}%`;
  }

  private handleLoaderComplete() {
    this.loadViewController(new MenuViewController());
  }
}

export default LoadingViewController;
