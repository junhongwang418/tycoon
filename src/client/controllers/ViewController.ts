import * as PIXI from "pixi.js";
import Application from "../Application";
import Color from "../Color";

abstract class ViewController extends PIXI.Container {
  protected backgroundFrame: PIXI.Graphics;

  constructor() {
    super();
    this.backgroundFrame = this.createBackgroundFrame();
  }

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

  protected abstract layout();

  protected abstract draw();

  protected abstract addEventListeners();

  protected abstract removeEventListeners();

  private init() {
    this.addChild(this.backgroundFrame);
    this.layout();
    this.draw();
    this.addEventListeners();
  }

  private createBackgroundFrame() {
    const frame = new PIXI.Graphics();
    frame.beginFill(Color.BLACK);
    frame.drawRect(0, 0, Application.WIDTH, Application.HEIGHT);
    return frame;
  }
}

export default ViewController;
