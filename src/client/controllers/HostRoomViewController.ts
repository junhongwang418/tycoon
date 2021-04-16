import Application from "../Application";
import Button from "../Button";
import Color from "../Color";
import Text from "../Text";
import * as PIXI from "pixi.js";
import CheckMark from "../CheckMark";
import { TycoonOptionKey } from "../../common/Tycoon";
import Overlay from "../Overlay";
import RoomViewController from "./RoomViewController";
import Layout from "../Layout";

class TycoonOptionCheckMark extends CheckMark {
  private optionKey: TycoonOptionKey;

  constructor(optionKey: TycoonOptionKey) {
    super({ fontSize: 36 });
    this.optionKey = optionKey;
  }

  public onCheck(cb: (optionKey: TycoonOptionKey, checked: boolean) => void) {
    this.onPointerDown((checked: boolean) => cb(this.optionKey, checked));
  }
}

class TycoonOptionsEditor extends Overlay {
  private static get WIDTH() {
    return (Application.WIDTH * 2) / 3;
  }
  private static get HEIGHT() {
    return (Application.HEIGHT * 2) / 3;
  }

  private frame: PIXI.Graphics;
  private closeButton: Button;
  private tycoonOptionTexts: Text[];
  private tycoonOptionCheckMarks: TycoonOptionCheckMark[];

  constructor() {
    super();
    this.frame = this.createFrame();
    this.closeButton = this.createCloseButton();
    this.tycoonOptionTexts = this.createTycoonOptionTexts();
    this.tycoonOptionCheckMarks = this.createTycoonOptionCheckMarks();

    this.layout();
    this.draw();
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

  private layout() {
    this.layoutFrame();
    this.layoutOptionTexts();
    this.layoutOptionCheckMarks();
  }

  private draw() {
    this.addChild(this.frame);
    this.frame.addChild(this.closeButton);
    this.frame.addChild(...this.tycoonOptionTexts);
    this.frame.addChild(...this.tycoonOptionCheckMarks);
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
        TycoonOptionsEditor.WIDTH - checkMark.width - Layout.spacing(2);
      checkMark.y = Layout.spacing(4) + Layout.spacing(5) * index;
    });
  }

  private layoutFrame() {
    this.frame.x = (Application.WIDTH - TycoonOptionsEditor.WIDTH) / 2;
    this.frame.y = (Application.HEIGHT - TycoonOptionsEditor.HEIGHT) / 2;
  }

  private createFrame() {
    const frame = new PIXI.Graphics();
    frame.lineStyle(1, Color.White);
    frame.drawRect(0, 0, TycoonOptionsEditor.WIDTH, TycoonOptionsEditor.HEIGHT);
    frame.endFill();
    return frame;
  }

  private createCloseButton() {
    const button = new Button("❌");
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

class HostRoomViewController extends RoomViewController {
  private startButton: Button;
  private settingsButton: Button;
  private tycoonOptionsEditor: TycoonOptionsEditor;

  constructor(roomId: string) {
    super(roomId);
    this.startButton = this.createStartButton();
    this.settingsButton = this.createSettingsButton();
    this.tycoonOptionsEditor = this.createTycoonOptionsEditor();
  }

  protected layout() {
    super.layout();
    this.layoutSettingsButton();
    this.layoutStartButton();
  }

  protected draw() {
    super.draw();
    this.addChild(this.startButton);
    this.addChild(this.settingsButton);
  }

  protected update() {
    super.update();
    this.updateStartButton();
  }

  private createTycoonOptionsEditor() {
    const editor = new TycoonOptionsEditor();
    editor.onUpdate(this.handleTycoonOptionsEditorUpdate));
    return editor;
  }

  private handleTycoonOptionsEditorUpdate = (
    optionKey: TycoonOptionKey,
    checked: boolean
  ) => {
    this.tycoonOptions[optionKey] = checked;
    this.updateTycoonOptionsView();
    const socket = Application.shared.socket;
    socket.emit("options-update", this.tycoonOptions);
  }

  private updateStartButton() {
    if (this.roomNumPlayers === this.roomCapacity) {
      this.startButton.enable();
    } else {
      this.startButton.disable();
    }
  }

  private createSettingsButton() {
    const button = new Button("⚙️");
    button.onPointerDown(this.handleSettingsButtonPointerDown);
    return button;
  }

  private handleSettingsButtonPointerDown = () => {
    this.addChild(this.tycoonOptionsEditor);
  }

  private createStartButton() {
    const button = new Button("start ▶");
    button.disable();
    button.onPointerDown(this.handleStartButtonPointerDown);
    return button;
  }

  private handleStartButtonPointerDown = () => {
    const socket = Application.shared.socket;
    socket.emit("start");
  }

  private layoutSettingsButton() {
    this.settingsButton.x =
      Application.WIDTH - this.settingsButton.width - Layout.spacing(3);
    this.settingsButton.y = Layout.spacing(3);
  }

  private layoutStartButton() {
    this.startButton.x =
      Application.WIDTH - this.startButton.width - Layout.spacing(3);
    this.startButton.y =
      Application.HEIGHT - this.startButton.height - Layout.spacing(3);
  }
}

export default HostRoomViewController;
