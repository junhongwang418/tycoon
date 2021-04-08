import * as PIXI from "pixi.js";
import ViewController from "./ViewController";
import io from "socket.io-client";
import LoadingViewController from "./LoadingViewController";

class App extends PIXI.Application {
  public static readonly WIDTH = 1280;
  public static readonly HEIGHT = 720;

  public static readonly shared = new App();

  public readonly socket: SocketIOClient.Socket;

  private constructor() {
    super({
      width: App.WIDTH,
      height: App.HEIGHT,
    });
    this.socket = io();
  }

  public init() {
    document.body.appendChild(this.view);
    this.addViewController(new LoadingViewController());
  }

  public addViewController(vc: ViewController) {
    this.stage.addChild(vc);
  }

  public removeViewController(vc: ViewController) {
    this.stage.removeChild(vc);
  }
}

export default App;
