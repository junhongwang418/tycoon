import App from "./App";
import WebFontLoader from "./WebFontLoader";

WebFontLoader.shared.onLoad(() => {
  App.shared.init();
});
