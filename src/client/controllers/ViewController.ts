import * as PIXI from "pixi.js";
import Application from "../Application";
import Color from "../Color";
import View from "../View";

class ViewController extends PIXI.Container {
  protected background: PIXI.Graphics;

  constructor() {
    super();
    this.background = this.createBackground();
  }

  protected layout() {}

  protected draw() {
    this.addChild(this.background);
  }

  protected addEventListeners() {}

  protected removeEventListeners() {}

  protected loadViewController(vc: ViewController) {
    this.removeEventListeners();
    Application.shared.removeAllViewControllers();
    Application.shared.addViewController(vc);
    vc.init();
  }

  protected pushViewController(vc: ViewController) {
    this.removeEventListeners();
    Application.shared.addViewController(vc);
    vc.init();
  }

  protected popViewController() {
    this.removeEventListeners();
    Application.shared.removeTopViewController();
    const vc = Application.shared.getTopViewController();
    vc.addEventListeners();
  }

  private init() {
    this.addChild(this.background);
    this.layout();
    this.draw();
    this.addEventListeners();
  }

  private createBackground() {
    const frame = new PIXI.Graphics();
    frame.beginFill(Color.Black);
    frame.drawRect(0, 0, Application.WIDTH, Application.HEIGHT);
    return frame;
  }
}

export default ViewController;
