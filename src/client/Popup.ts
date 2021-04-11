import * as PIXI from "pixi.js";
import Application from "./Application";
import Color from "./Color";
import Container from "./Container";

class Popup extends PIXI.Container {
  private frame: PIXI.Graphics;

  protected view: Container;

  constructor(view: Container) {
    super();
    this.frame = this.createFrame();
    this.view = view;
    this.draw();
  }

  private createFrame() {
    const frame = new PIXI.Graphics();
    frame.beginFill(Color.BLACK, 0.5);
    frame.drawRect(0, 0, Application.WIDTH, Application.HEIGHT);
    frame.endFill();
    frame.interactive = true;
    frame.hitArea = new PIXI.Rectangle(
      0,
      0,
      Application.WIDTH,
      Application.HEIGHT
    );
    frame.on("pointerdown", (e: PIXI.InteractionEvent) => {
      e.stopPropagation();
    });
    return frame;
  }

  private drawFrame() {
    this.addChild(this.frame);
  }

  private drawView() {
    this.frame.addChild(this.view);
  }

  private draw() {
    this.drawFrame();
    this.drawView();
  }
}

export default Popup;
