import * as PIXI from "pixi.js";

class Container extends PIXI.Container {
  protected isOriginCenter: boolean;

  constructor() {
    super();
    this.isOriginCenter = false;
  }

  protected setCenterAsOriginBasedOnCurrentSize() {
    this.pivot.set(this.width / 2, this.height / 2);
  }

  public setCenterAsOrigin() {
    this.isOriginCenter = true;
    this.setCenterAsOriginBasedOnCurrentSize();
  }
}

export default Container;
