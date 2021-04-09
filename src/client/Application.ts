import * as PIXI from "pixi.js";
import ViewController from "./ViewController";
import io from "socket.io-client";
import LoadingViewController from "./LoadingViewController";
import WebFontLoader from "./WebFontLoader";

class Application {
  public static readonly WIDTH = 1280;
  public static readonly HEIGHT = 720;

  public static readonly shared = new Application();

  public readonly socket: SocketIOClient.Socket;

  private app: PIXI.Application;

  private constructor() {
    this.app = new PIXI.Application({
      width: Application.WIDTH,
      height: Application.HEIGHT,
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
