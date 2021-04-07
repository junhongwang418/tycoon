import * as PIXI from "pixi.js";
import President from "./President";
import WebFontLoader from "./WebFontLoader";

WebFontLoader.shared.onLoad(() => {
  const app = new PIXI.Application();
  document.body.appendChild(app.view);
  const president = new President(app.stage);
  president.start();
});
