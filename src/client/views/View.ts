import * as PIXI from "pixi.js";

class View extends PIXI.Container {
  protected initialized: boolean;
  protected isCenterOrigin: boolean;

  constructor() {
    super();
    this.initialized = false;
    this.isCenterOrigin = false;
  }

  public init() {
    if (this.initialized) return;
    this.layout();
    this.draw();
    if (this.isCenterOrigin) this.setCenterAsOriginBasedOnCurrentSize();
    this.initialized = true;
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

  protected addEventListenersRecursively() {
    this.addEventListeners();
    this.children.forEach((child) => {
      if (child instanceof View) child.addEventListeners();
    });
  }

  public removeEventListeners() {}

  protected removeEventListenersRecursively() {
    this.removeEventListeners();
    this.children.forEach((child) => {
      if (child instanceof View) child.removeEventListeners();
    });
  }

  public addView(view: View) {
    if (view.initialized) {
      view.addEventListenersRecursively();
    } else {
      view.init();
      view.addEventListeners();
    }
    this.addChild(view);
  }

  public addViews(...views: View[]) {
    views.forEach((view) => this.addView(view));
  }

  public removeView(view: View) {
    view.removeEventListenersRecursively();
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
