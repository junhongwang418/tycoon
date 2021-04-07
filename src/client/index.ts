import * as PIXI from "pixi.js";
import Tycoon from "./Tycoon";
import WebFontLoader from "./WebFontLoader";

WebFontLoader.shared.onLoad(() => {
  const app = new PIXI.Application();
  app.stage.interactive = true;
  app.stage.hitArea = new PIXI.Rectangle(0, 0, 800, 600);
  document.body.appendChild(app.view);
  const tycoon = new Tycoon(app.stage);
  tycoon.start();
});
