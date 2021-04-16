import * as PIXI from "pixi.js";
import Application from "../Application";
import Color from "../Color";
import View from "../views/View";

class ViewController extends PIXI.Container {
  private initialized: boolean;
  protected background: PIXI.Graphics;

  constructor() {
    super();
    this.initialized = false;
    this.background = this.createBackground();
  }

  protected layout() {}

  protected draw() {
    this.addChild(this.background);
  }

  protected addEventListeners() {}

  protected removeEventListeners() {
    this.children.forEach((child) => {
      if (child instanceof View) child.removeEventListeners();
    });
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

  public init() {
    if (this.initialized) return;
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

  public addView(view: View) {
    if (!view.isInitialized()) view.init();
    this.addChild(view);
    view.addEventListeners();
  }

  public addViews(...views: View[]) {
    views.forEach((view) => this.addView(view));
  }

  public removeView(view: View) {
    view.removeEventListeners();
    this.removeChild(view);
  }

  public removeViews(...views: View[]) {
    views.forEach((view) => this.removeView(view));
  }
}

export default ViewController;
