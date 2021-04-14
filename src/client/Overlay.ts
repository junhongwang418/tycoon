import * as PIXI from "pixi.js";
import Application from "./Application";
import Color from "./Color";
import Container from "./Container";

class Overlay extends Container {
  private static readonly BACKGROUND_ALPHA = 0.92;
  private interactionWall: PIXI.Graphics;

  constructor() {
    super();
    this.interactionWall = this.createInteractionWall();
    this.addChild(this.interactionWall);
  }

  private createInteractionWall() {
    const frame = new PIXI.Graphics();
    frame.beginFill(Color.BLACK, Overlay.BACKGROUND_ALPHA);
    frame.drawRect(0, 0, Application.WIDTH, Application.HEIGHT);
    frame.endFill();
    frame.interactive = true;
    frame.hitArea = new PIXI.Rectangle(
      0,
      0,
      Application.WIDTH,
      Application.HEIGHT
    );
    frame.on("pointerdown", this.handleInteractionWallPointerDown);
    return frame;
  }

  private handleInteractionWallPointerDown = (e: PIXI.InteractionEvent) => {
    e.stopPropagation();
  };
}

export default Overlay;
