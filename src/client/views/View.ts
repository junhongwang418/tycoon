import * as PIXI from "pixi.js";

class View extends PIXI.Container {
  protected initialized: boolean;
  protected isCenterOrigin: boolean;

  constructor() {
    super();
    this.initialized = false;
    this.isCenterOrigin = false;
  }

  protected init() {
    if (this.initialized) return;
    this.layout();
    this.draw();
    if (this.isCenterOrigin) this.setCenterAsOriginBasedOnCurrentSize();
    this.addEventListeners();
    this.initialized = true;
    this.onInit();
  }

  public setCenterAsOrigin() {
    this.isCenterOrigin = true;
    this.setCenterAsOriginBasedOnCurrentSize();
  }

  public addView(view: View) {
    if (view.initialized) {
      view.addEventListenersRecursively();
    } else {
      view.init();
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

  public bringToFront() {
    const parent = this.parent;
    if (parent instanceof View) {
      parent.removeView(this);
      parent.addView(this);
    }
  }

  protected layout() {}

  protected draw() {}

  protected addEventListeners() {}

  protected removeEventListeners() {}

  protected onInit() {}

  protected addEventListenersRecursively() {
    this.addEventListeners();
    this.children.forEach((child) => {
      if (child instanceof View) child.addEventListeners();
    });
  }

  protected removeEventListenersRecursively() {
    this.removeEventListeners();
    this.children.forEach((child) => {
      if (child instanceof View) child.removeEventListeners();
    });
  }

  protected setCenterAsOriginBasedOnCurrentSize() {
    this.pivot.set(this.width / 2, this.height / 2);
  }
}

export default View;
