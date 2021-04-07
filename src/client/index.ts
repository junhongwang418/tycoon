import * as PIXI from "pixi.js";
import Tycoon from "./Tycoon";
import WebFontLoader from "./WebFontLoader";

WebFontLoader.shared.onLoad(() => {
  const width = 1280;
  const height = 720;
  const app = new PIXI.Application({
    width,
    height,
  });
  app.stage.interactive = true;
  app.stage.hitArea = new PIXI.Rectangle(0, 0, width, height);
  document.body.appendChild(app.view);
  const tycoon = new Tycoon(app.stage);
  tycoon.start();
});
