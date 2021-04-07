import * as PIXI from "pixi.js";
import Tycoon from "./Tycoon";
import WebFontLoader from "./WebFontLoader";

WebFontLoader.shared.onLoad(() => {
  const app = new PIXI.Application();
  document.body.appendChild(app.view);
  const tycoon = new Tycoon(app.stage);
  tycoon.start();
});
