import * as PIXI from "pixi.js";
import App from "./App";

class ViewController extends PIXI.Container {
  protected loadViewController(vc: ViewController) {
    App.shared.removeViewController(this);
    App.shared.addViewController(vc);
  }
}

export default ViewController;
