import * as PIXI from "pixi.js";
import Application from "./Application";

class ViewController extends PIXI.Container {
  protected loadViewController(vc: ViewController) {
    this.cleanUp();
    Application.shared.removeViewController(this);
    Application.shared.addViewController(vc);
  }

  protected cleanUp() {}
}

export default ViewController;
