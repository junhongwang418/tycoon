import * as PIXI from "pixi.js";

class View extends PIXI.Container {
  private initialized: boolean;

  protected isCenterOrigin: boolean;

  constructor() {
    super();
    this.initialized = false;
    this.isCenterOrigin = false;
  }

  public init() {
    this.initialized = true;
    this.layout();
    this.draw();
    if (this.isCenterOrigin) this.setCenterAsOriginBasedOnCurrentSize();
  }

  public setCenterAsOrigin() {
    this.isCenterOrigin = true;
    this.setCenterAsOriginBasedOnCurrentSize();
  }

  public isInitialized() {
    return this.initialized;
  }

  protected layout() {}

  protected draw() {}

  public addEventListeners() {}

  public removeEventListeners() {
    this.children.forEach((child) => {
      if (child instanceof View) child.removeEventListeners();
    });
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

  protected setCenterAsOriginBasedOnCurrentSize() {
    this.pivot.set(this.width / 2, this.height / 2);
  }
}

export default View;
