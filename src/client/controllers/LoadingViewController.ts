import * as PIXI from "pixi.js";
import MenuViewController from "./MenuViewController";
import Text from "../views/Text";
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
    this.addView(this.loadingText);
    this.addView(this.percentageText);
  }

  private layoutLoadingText() {
    this.loadingText.setCenterAsOrigin();
    this.loadingText.x = Application.WIDTH / 2;
    this.loadingText.y = Application.HEIGHT / 2 - Layout.spacing(4);
  }

  private layoutPercentageText() {
    this.percentageText.setCenterAsOrigin();
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
    this.percentageText.updateText(`${Math.round(loader.progress)}%`);
  }

  private handleLoaderComplete() {
    this.loadViewController(new MenuViewController());
  }
}

export default LoadingViewController;
