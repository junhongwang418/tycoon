import * as PIXI from "pixi.js";
import ViewController from "./controllers/ViewController";
import io from "socket.io-client";
import LoadingViewController from "./controllers/LoadingViewController";
import WebFontLoader from "./WebFontLoader";

class Application {
  public static readonly WIDTH = 800;
  public static readonly HEIGHT = 600;
  public static readonly shared = new Application();

  public readonly socket: SocketIOClient.Socket;

  private app: PIXI.Application;

  private constructor() {
    this.app = new PIXI.Application({
      width: Application.WIDTH,
      height: Application.HEIGHT,
      resolution: window.devicePixelRatio,
      autoDensity: true,
    });
    this.socket = io();
  }

  public start() {
    WebFontLoader.shared.onLoad(this.handleWebFontLoad.bind(this));
  }

  public addViewController(vc: ViewController) {
    return this.app.stage.addChild(vc);
  }

  public removeViewController(vc: ViewController) {
    return this.app.stage.removeChild(vc);
  }

  public removeAllViewControllers() {
    return this.app.stage.removeChildren();
  }

  public removeTopViewController() {
    if (this.app.stage.children.length === 0) return null;
    return this.app.stage.removeChildAt(this.app.stage.children.length - 1);
  }

  public getTopViewController() {
    if (this.app.stage.children.length === 0) return null;
    return this.app.stage.getChildAt(
      this.app.stage.children.length - 1
    ) as ViewController;
  }

  private handleWebFontLoad() {
    document.body.appendChild(this.app.view);
    this.addViewController(new LoadingViewController());
  }
}

export default Application;
