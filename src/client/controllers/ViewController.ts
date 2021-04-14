import * as PIXI from "pixi.js";
import Application from "../Application";

abstract class ViewController extends PIXI.Container {
  protected loadViewController(vc: ViewController) {
    this.removeEventListeners();
    Application.shared.removeViewController(this);
    Application.shared.addViewController(vc);
    vc.init();
  }

  private init() {
    this.layout();
    this.draw();
    this.addEventListeners();
  }

  protected abstract layout();

  protected abstract draw();

  protected abstract addEventListeners();

  protected abstract removeEventListeners();
}

export default ViewController;
