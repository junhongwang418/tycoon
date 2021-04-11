import * as PIXI from "pixi.js";
import ViewController from "./ViewController";
import io from "socket.io-client";
import LoadingViewController from "./LoadingViewController";
import WebFontLoader from "./WebFontLoader";

class Application {
  public static readonly WIDTH = 800;
  public static readonly HEIGHT = 600;
  public static readonly SPACING = 8;

  public static spacing(count: number) {
    return Application.SPACING * count;
  }

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
    WebFontLoader.shared.onLoad(() => {
      document.body.appendChild(this.app.view);
      this.addViewController(new LoadingViewController());
    });
  }

  public addViewController(vc: ViewController) {
    this.app.stage.addChild(vc);
  }

  public removeViewController(vc: ViewController) {
    this.app.stage.removeChild(vc);
  }
}

export default Application;
