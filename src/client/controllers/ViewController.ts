import Application from "../Application";
import Color from "../Color";
import Frame from "../views/Frame";
import View from "../views/View";

class ViewController extends View {
  protected background: Frame;

  constructor() {
    super();
    this.background = new Frame({
      width: Application.WIDTH,
      height: Application.HEIGHT,
      fill: Color.Black,
    });
  }

  protected draw() {
    super.draw();
    this.addView(this.background);
  }

  protected loadViewController(vc: ViewController) {
    this.removeEventListenersRecursively();
    Application.shared.removeAllViewControllers();
    Application.shared.addViewController(vc);
    vc.init();
    vc.addEventListeners();
  }

  protected pushViewController(vc: ViewController) {
    this.removeEventListenersRecursively();
    Application.shared.addViewController(vc);
    vc.init();
    vc.addEventListeners();
  }

  protected popViewController() {
    this.removeEventListenersRecursively();
    Application.shared.removeTopViewController();
    const vc = Application.shared.getTopViewController();
    vc.addEventListenersRecursively();
  }
}

export default ViewController;
