import * as PIXI from "pixi.js";

class View extends PIXI.Container {
  protected isCenterOrigin: boolean;

  constructor() {
    super();
    this.isCenterOrigin = false;
  }

  public setCenterAsOrigin() {
    this.isCenterOrigin = true;
    this.setCenterAsOriginBasedOnCurrentSize();
  }

  protected setCenterAsOriginBasedOnCurrentSize() {
    this.pivot.set(this.width / 2, this.height / 2);
  }
}

export default View;
