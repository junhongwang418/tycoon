import * as PIXI from "pixi.js";
import { CardSuit, CardValue } from "../common/Card";
import Color from "./Color";
import MenuViewController from "./MenuViewController";
import Text from "./Text";
import ViewController from "./ViewController";
import App from "./App";

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
    console.log(this.loadingIndicator.width);
    this.loadingIndicator.x = App.WIDTH / 2 - this.loadingIndicator.width / 2;
    this.loadingIndicator.y = App.HEIGHT / 2;
    this.addChild(this.loadingIndicator);
  }

  private drawLoadingText() {
    this.loadingText.anchor.set(0.5);
    this.loadingText.x = App.WIDTH / 2;
    this.loadingText.y = App.HEIGHT / 2 - 100;
    this.addChild(this.loadingText);
  }

  private loadGameAssets() {
    const loader = PIXI.Loader.shared;

    const allCardValues = Object.values(CardValue);
    const allCardSuits = Object.values(CardSuit);

    allCardValues.forEach((value) => {
      allCardSuits.forEach((suit) => {
        loader.add(`card${suit}${value}.png`);
      });
    });

    loader.onProgress.add((loader) => {
      this.loadingIndicator.setPercentage(Math.round(loader.progress));
    });

    loader.load(() => {
      this.loadViewController(new MenuViewController());
    });
  }
}

export default LoadingViewController;
