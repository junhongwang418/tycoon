import { TycoonOptionKey, TycoonOptions } from "../../common/Tycoon";
import Layout from "../Layout";
import Text from "./Text";
import View from "./View";

class TycoonOptionsView extends View {
  private static readonly FONT_SIZE = 16;

  private customSettingsText: Text;
  private tycoonOptionTexts: Text[];

  constructor(tycoonOptions: TycoonOptions) {
    super();
    this.customSettingsText = new Text("Custom Settings", {
      fontSize: TycoonOptionsView.FONT_SIZE,
    });
    this.tycoonOptionTexts = this.createTycoonOptionTexts();
    this.updateTycoonOptionTexts(tycoonOptions);
  }

  protected layout() {
    super.layout();
    this.layoutOptionTexts();
  }

  protected draw() {
    super.draw();
    this.addView(this.customSettingsText);
    this.addViews(...this.tycoonOptionTexts);
  }

  private createTycoonOptionTexts() {
    const texts = [];
    const optionKeys = Object.values(TycoonOptionKey);
    optionKeys.forEach(() => {
      texts.push(new Text("", { fontSize: TycoonOptionsView.FONT_SIZE }));
    });
    return texts;
  }

  private layoutOptionTexts() {
    this.tycoonOptionTexts.forEach((text, index) => {
      text.y =
        this.customSettingsText.height +
        Layout.spacing(2) +
        Layout.spacing(2) * index;
    });
  }

  public updateTycoonOptionTexts(tycoonOptions: TycoonOptions) {
    const optionKeys = Object.values(TycoonOptionKey);
    optionKeys.forEach((optionKey, index) => {
      const text = this.tycoonOptionTexts[index];
      const checked = tycoonOptions[optionKey];
      text.updateText(`${optionKey.toString()}: ${checked ? "yes" : "no"}`);
    });
  }
}

export default TycoonOptionsView;
