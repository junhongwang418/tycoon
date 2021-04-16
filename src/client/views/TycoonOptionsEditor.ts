import * as PIXI from "pixi.js";
import { TycoonOptionKey } from "../../common/Tycoon";
import Application from "../Application";
import Color from "../Color";
import Layout from "../Layout";
import Button from "./Button";
import Frame from "./Frame";
import Overlay from "./Overlay";
import Text from "./Text";
import TycoonOptionCheckMark from "./TycoonOptionCheckMark";

class TycoonOptionsEditor extends Overlay {
  private static get WIDTH() {
    return (Application.WIDTH * 2) / 3;
  }
  private static get HEIGHT() {
    return (Application.HEIGHT * 2) / 3;
  }

  private frame: Frame;
  private closeButton: Button;
  private tycoonOptionTexts: Text[];
  private tycoonOptionCheckMarks: TycoonOptionCheckMark[];

  constructor() {
    super();
    this.frame = new Frame({
      width: TycoonOptionsEditor.WIDTH,
      height: TycoonOptionsEditor.HEIGHT,
      border: Color.White,
    });
    this.closeButton = this.createCloseButton();
    this.tycoonOptionTexts = this.createTycoonOptionTexts();
    this.tycoonOptionCheckMarks = this.createTycoonOptionCheckMarks();
  }

  private createTycoonOptionTexts() {
    const texts = [];
    const optionKeys = Object.values(TycoonOptionKey);
    optionKeys.forEach((optionKey) => {
      texts.push(new Text(optionKey.toString()));
    });
    return texts;
  }

  private createTycoonOptionCheckMarks() {
    const checkMarks = [];
    const optionKeys = Object.values(TycoonOptionKey);
    optionKeys.forEach((optionKey) => {
      checkMarks.push(new TycoonOptionCheckMark(optionKey));
    });
    return checkMarks;
  }

  protected layout() {
    super.layout();
    this.layoutFrame();
    this.layoutOptionTexts();
    this.layoutOptionCheckMarks();
  }

  protected draw() {
    super.draw();
    this.addView(this.frame);
    this.frame.addView(this.closeButton);
    this.frame.addViews(...this.tycoonOptionTexts);
    this.frame.addViews(...this.tycoonOptionCheckMarks);
  }

  private layoutOptionTexts() {
    this.tycoonOptionTexts.forEach((text, index) => {
      text.x = Layout.spacing(2);
      text.y = Layout.spacing(4) + Layout.spacing(5) * index;
    });
  }

  private layoutOptionCheckMarks() {
    this.tycoonOptionCheckMarks.forEach((checkMark, index) => {
      checkMark.x =
        TycoonOptionsEditor.WIDTH -
        checkMark.getTextSize().width -
        Layout.spacing(2);
      checkMark.y = Layout.spacing(4) + Layout.spacing(5) * index;
    });
  }

  private layoutFrame() {
    this.frame.x = (Application.WIDTH - TycoonOptionsEditor.WIDTH) / 2;
    this.frame.y = (Application.HEIGHT - TycoonOptionsEditor.HEIGHT) / 2;
  }

  private createCloseButton() {
    const button = new Button("⨯");
    button.setCenterAsOrigin();
    button.on("pointerdown", this.handleCloseButtonPointerDown.bind(this));
    return button;
  }

  private handleCloseButtonPointerDown() {
    this.parent.removeChild(this);
  }

  public onUpdate(cb: (optionKey: TycoonOptionKey, checked: boolean) => void) {
    this.tycoonOptionCheckMarks.forEach((checkMark) => checkMark.onCheck(cb));
  }
}

export default TycoonOptionsEditor;
