import * as PIXI from "pixi.js";
import { CardSuit, CardValue } from "../common/Card";
import Color from "./Color";
import MenuViewController from "./MenuViewController";
import Text from "./Text";
import ViewController from "./ViewController";
import Application from "./Application";

class LoadingIndicator extends PIXI.Container {
  private percentageText: Text;

  constructor() {
    super();
    this.percentageText = new Text("", { fill: Color.WHITE });
    this.addChild(this.percentageText);
  }

  public setPercentage(percentage: number) {
    this.percentageText.text = `${percentage}%`;
  }
}

class LoadingViewController extends ViewController {
  private loadingText: Text;
  private loadingIndicator: LoadingIndicator;

  constructor() {
    super();
    this.loadingText = new Text("Loading...", { fill: Color.WHITE });
    this.loadingIndicator = new LoadingIndicator();

    this.drawLoadingText();
    this.drawLoadingIndicator();
    this.loadGameAssets();
  }

  private drawLoadingIndicator() {
    this.loadingIndicator.x =
      Application.WIDTH / 2 - this.loadingIndicator.width / 2;
    this.loadingIndicator.y = Application.HEIGHT / 2;
    this.addChild(this.loadingIndicator);
  }

  private drawLoadingText() {
    this.loadingText.anchor.set(0.5);
    this.loadingText.x = Application.WIDTH / 2;
    this.loadingText.y = Application.HEIGHT / 2 - 100;
    this.addChild(this.loadingText);
  }

  private loadGameAssets() {
    const loader = PIXI.Loader.shared;

    const values = Object.values(CardValue);
    const suits = Object.values(CardSuit);

    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < suits.length; j++) {
        loader.add(`card${suits[j]}${values[i]}.png`);
      }
    }

    loader.onProgress.add((loader) => {
      this.loadingIndicator.setPercentage(Math.round(loader.progress));
    });

    loader.load(() => {
      this.loadViewController(new MenuViewController());
    });
  }
}

export default LoadingViewController;
