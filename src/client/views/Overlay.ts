import * as PIXI from "pixi.js";
import Application from "../Application";
import Color from "../Color";
import View from "./View";

class Overlay extends View {
  private static readonly BACKGROUND_ALPHA = 0.96;
  private firewall: PIXI.Graphics;

  constructor() {
    super();
    this.firewall = this.createFirewall();
  }

  protected draw() {
    super.draw();
    this.addChild(this.firewall);
  }

  private createFirewall() {
    const frame = new PIXI.Graphics();
    frame.beginFill(Color.Black, Overlay.BACKGROUND_ALPHA);
    frame.drawRect(0, 0, Application.WIDTH, Application.HEIGHT);
    frame.endFill();
    frame.interactive = true;
    frame.hitArea = new PIXI.Rectangle(
      0,
      0,
      Application.WIDTH,
      Application.HEIGHT
    );
    frame.on("pointerdown", this.handleFirewallPointerDown);
    return frame;
  }

  private handleFirewallPointerDown = (e: PIXI.InteractionEvent) => {
    e.stopPropagation();
  };
}

export default Overlay;
