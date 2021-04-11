import PIXISound from "pixi-sound";

class Sound {
  public static getFilePaths() {
    return ["click1.ogg", "cardSlide1.ogg", "cardPlace1.ogg"];
  }

  public static play(filePath: string) {
    PIXISound.play(filePath);
  }
}

export default Sound;
