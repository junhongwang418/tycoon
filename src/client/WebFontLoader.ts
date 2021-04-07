class WebFontLoader {
  public static readonly FONT_FAMILY = "Roboto Mono";

  public static shared = new WebFontLoader();

  public onLoad(callback: () => void) {
    // web-font loader script will read WebFontConfig
    // to determine the fonts to load and what to do
    // next when all fonts are loaded
    // @ts-ignore
    window.WebFontConfig = {
      google: {
        families: [WebFontLoader.FONT_FAMILY],
      },

      active() {
        callback();
      },
    };

    this.includeWebFontLoaderScript();
  }

  private includeWebFontLoaderScript() {
    const wf = document.createElement("script");
    wf.src = `${
      document.location.protocol === "https:" ? "https" : "http"
    }://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js`;
    wf.type = "text/javascript";
    wf.async = true;
    const s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(wf, s);
  }
}

export default WebFontLoader;
