import Application from "../Application";
import Button from "../Button";
import Color from "../Color";
import Text from "../Text";
import * as PIXI from "pixi.js";
import CheckMark from "../CheckMark";
import { TycoonOptionKey } from "../../common/Tycoon";
import Overlay from "../Overlay";
import RoomViewController from "./RoomViewController";
import { RoomJson } from "../../common/Room";

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
  private tycoonOptionCheckMarks: CheckMark[];
  private handleCheckMarkPointerDown: (
    optionKey: TycoonOptionKey,
    checked: boolean
  ) => void;

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
      texts.push(new Text(optionKey.toString(), { fill: Color.WHITE }));
    });
    return texts;
  }

  private createTycoonOptionCheckMarks() {
    const checkMarks = [];
    const optionKeys = Object.values(TycoonOptionKey);
    optionKeys.forEach((optionKey) => {
      const checkMark = new CheckMark({ fill: Color.WHITE, fontSize: 36 });
      checkMark.onPointerDown((checked: boolean) => {
        this.handleCheckMarkPointerDown(optionKey, checked);
      });
      checkMarks.push(checkMark);
    });
    return checkMarks;
  }

  private layout() {
    this.layoutFrame();
    this.layoutOptionTexts();
    this.layoutOptionCheckMarks();
  }

  private layoutOptionTexts() {
    this.tycoonOptionTexts.forEach((text, index) => {
      text.x = Application.spacing(2);
      text.y = Application.spacing(4) + Application.spacing(5) * index;
    });
  }

  private layoutOptionCheckMarks() {
    this.tycoonOptionCheckMarks.forEach((checkMark, index) => {
      checkMark.x =
        TycoonOptionsEditor.WIDTH - checkMark.width - Application.spacing(2);
      checkMark.y = Application.spacing(4) + Application.spacing(5) * index;
    });
  }

  private draw() {
    this.addChild(this.frame);
    this.frame.addChild(this.closeButton);
    this.frame.addChild(...this.tycoonOptionTexts);
    this.frame.addChild(...this.tycoonOptionCheckMarks);
  }

  private layoutFrame() {
    this.frame.x = (Application.WIDTH - TycoonOptionsEditor.WIDTH) / 2;
    this.frame.y = (Application.HEIGHT - TycoonOptionsEditor.HEIGHT) / 2;
  }

  private createFrame() {
    const frame = new PIXI.Graphics();
    frame.lineStyle(1, Color.WHITE);
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
    this.handleCheckMarkPointerDown = cb;
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

  protected handleSocketRoomStatusUpdate(roomJson: RoomJson) {
    super.handleSocketRoomStatusUpdate(roomJson);
    this.updateStartButton();
  }

  private createTycoonOptionsEditor() {
    const editor = new TycoonOptionsEditor();
    editor.onUpdate(this.handleTycoonOptionsEditorUpdate.bind(this));
    return editor;
  }

  private handleTycoonOptionsEditorUpdate(
    optionKey: TycoonOptionKey,
    checked: boolean
  ) {
    this.tycoonOptions[optionKey] = checked;
    this.tycoonOptionsView.setTycoonOptions(this.tycoonOptions);
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
    button.onPointerDown(this.handleSettingsButtonPointerDown.bind(this));
    return button;
  }

  private handleSettingsButtonPointerDown() {
    this.addChild(this.tycoonOptionsEditor);
  }

  private createStartButton() {
    const button = new Button("start ▶");
    button.disable();
    button.onPointerDown(this.handleStartButtonPointerDown.bind(this));
    return button;
  }

  private handleStartButtonPointerDown() {
    const socket = Application.shared.socket;
    socket.emit("start");
  }

  private layoutSettingsButton() {
    this.settingsButton.x =
      Application.WIDTH - this.settingsButton.width - Application.spacing(3);
    this.settingsButton.y = Application.spacing(3);
  }

  private layoutStartButton() {
    this.startButton.x =
      Application.WIDTH - this.startButton.width - Application.spacing(3);
    this.startButton.y =
      Application.HEIGHT - this.startButton.height - Application.spacing(3);
  }
}

export default HostRoomViewController;
