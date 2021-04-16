import Application from "../Application";
import Button from "../views/Button";
import { TycoonOptionKey } from "../../common/Tycoon";
import RoomViewController from "./RoomViewController";
import Layout from "../Layout";
import TycoonOptionsEditor from "../views/TycoonOptionsEditor";

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
    this.addView(this.startButton);
    this.addView(this.settingsButton);
  }

  protected update() {
    super.update();
    this.updateStartButton();
  }

  private createTycoonOptionsEditor() {
    const editor = new TycoonOptionsEditor();
    editor.onUpdate(this.handleTycoonOptionsEditorUpdate);
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
  };

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
    this.addView(this.tycoonOptionsEditor);
  };

  private createStartButton() {
    const button = new Button("start ▶");
    button.disable();
    button.onPointerDown(this.handleStartButtonPointerDown);
    return button;
  }

  private handleStartButtonPointerDown = () => {
    const socket = Application.shared.socket;
    socket.emit("start");
  };

  private layoutSettingsButton() {
    this.settingsButton.x =
      Application.WIDTH -
      this.settingsButton.getSize().width -
      Layout.spacing(3);
    this.settingsButton.y = Layout.spacing(3);
  }

  private layoutStartButton() {
    this.startButton.x =
      Application.WIDTH - this.startButton.getSize().width - Layout.spacing(3);
    this.startButton.y =
      Application.HEIGHT -
      this.startButton.getSize().height -
      Layout.spacing(3);
  }
}

export default HostRoomViewController;
