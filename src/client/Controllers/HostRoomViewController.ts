import Application from "../Application";
import Button from "../Button";
import Color from "../Color";
import Text from "../Text";
import * as PIXI from "pixi.js";
import CheckMark from "../CheckMark";
import { TycoonOptionKey } from "../../common/Tycoon";
import Popup from "../Popup";
import RoomViewController from "./RoomViewController";
import { RoomJson } from "../../common/Room";

class TycoonOptionsEditor extends Popup {
  private static get WIDTH() {
    return (Application.WIDTH * 2) / 3;
  }
  private static get HEIGHT() {
    return (Application.HEIGHT * 2) / 3;
  }

  private frame: PIXI.Graphics;
  private crossButton: Button;

  private optionTexts: Text[];
  private optionCheckMarks: CheckMark[];

  private handleClose = () => {};
  private handleUpdate = (optionKey: TycoonOptionKey, checked: boolean) => {};

  constructor() {
    super();

    const textStyle: Partial<PIXI.ITextStyle> = {
      fill: Color.WHITE,
      stroke: Color.BLACK,
      strokeThickness: 3,
    };

    this.frame = this.createFrame();
    this.crossButton = this.createCrossButton();
    this.optionTexts = [];
    this.optionCheckMarks = [];

    const optionKeys = Object.values(TycoonOptionKey);
    optionKeys.forEach((optionKey) => {
      this.optionTexts.push(new Text(optionKey.toString(), textStyle));

      const checkMark = new CheckMark();
      checkMark.onPointerDown((checked: boolean) => {
        this.handleUpdate(optionKey, checked);
      });

      this.optionCheckMarks.push(checkMark);
    });

    this.layout();
    this.draw();
  }

  private layout() {
    this.layoutFrame();
    this.layoutOptionTexts();
    this.layoutOptionCheckMarks();
  }

  private layoutOptionTexts() {
    this.optionTexts.forEach((text, index) => {
      text.x = Application.spacing(2);
      text.y = Application.spacing(4) + Application.spacing(5) * index;
    });
  }

  private layoutOptionCheckMarks() {
    this.optionCheckMarks.forEach((checkMark, index) => {
      checkMark.x =
        TycoonOptionsEditor.WIDTH - checkMark.width - Application.spacing(2);
      checkMark.y = Application.spacing(4) + Application.spacing(5) * index;
    });
  }

  private draw() {
    this.addChild(this.frame);
    this.frame.addChild(this.crossButton);
    this.frame.addChild(...this.optionTexts);
    this.frame.addChild(...this.optionCheckMarks);
  }

  private layoutFrame() {
    this.frame.x = (Application.WIDTH - TycoonOptionsEditor.WIDTH) / 2;
    this.frame.y = (Application.HEIGHT - TycoonOptionsEditor.HEIGHT) / 2;
  }

  private createFrame() {
    const frame = new PIXI.Graphics();
    frame.lineStyle(1, Color.BLACK);
    frame.beginFill(Color.GREEN, 0.96);
    frame.drawRect(0, 0, TycoonOptionsEditor.WIDTH, TycoonOptionsEditor.HEIGHT);
    frame.endFill();
    return frame;
  }

  private createCrossButton() {
    const button = new Button("❌");
    button.setCenterAsOrigin();
    button.on("click", () => this.handleClose());
    return button;
  }

  public onClose(cb: () => void) {
    this.handleClose = cb;
  }

  public onUpdate(cb: (optionKey: TycoonOptionKey, checked: boolean) => void) {
    this.handleUpdate = cb;
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
    this.drawStartButton();
    this.drawSettingsButton();
  }

  protected handleSocketRoomStatusUpdate(roomJson: RoomJson) {
    super.handleSocketRoomStatusUpdate(roomJson);
    this.updateStartButton();
  }

  private createTycoonOptionsEditor() {
    const editor = new TycoonOptionsEditor();
    editor.onClose(() => {
      this.removeChild(editor);
    });
    editor.onUpdate((optionKey, checked) => {
      this.tycoonOptions[optionKey] = checked;
      this.tycoonOptionsText.setTycoonOptions(this.tycoonOptions);
      const socket = Application.shared.socket;
      socket.emit("options-update", this.tycoonOptions);
    });
    return editor;
  }

  private updateStartButton() {
    if (this.numPeople === this.roomCapacity) {
      this.startButton.enable();
    } else {
      this.startButton.disable();
    }
  }

  private createSettingsButton() {
    const button = new Button("⚙️");
    button.onPointerDown(() => {
      this.addChild(this.tycoonOptionsEditor);
    });
    return button;
  }

  private createStartButton() {
    const button = new Button("start ▶");
    button.disable();
    button.onPointerDown(() => {
      const socket = Application.shared.socket;
      socket.emit("start");
    });
    return button;
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

  private drawSettingsButton() {
    this.addChild(this.settingsButton);
  }

  private drawStartButton() {
    this.addChild(this.startButton);
  }
}

export default HostRoomViewController;
