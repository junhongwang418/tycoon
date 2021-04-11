import Application from "./Application";
import Button from "./Button";
import Color from "./Color";
import LobbyViewController from "./LobbyViewController";
import Text from "./Text";
import TycoonViewController from "./TycoonViewController";
import ViewController from "./ViewController";
import { RoomJson } from "../server/Room";
import Container from "./Container";
import * as PIXI from "pixi.js";
import CheckMark from "./CheckMark";
import { TycoonOptions } from "../common/Tycoon";
import Popup from "./Popup";

class TycoonOptionsEditor extends Container {
  private static get WIDTH() {
    return (Application.WIDTH * 2) / 3;
  }
  private static get HEIGHT() {
    return (Application.HEIGHT * 2) / 3;
  }

  private frame: PIXI.Graphics;
  private crossButton: Button;

  private revolutionText: Text;
  private revolutionCheckMark: CheckMark;

  private eightStopText: Text;
  private eightStopCheckMark: CheckMark;

  private sequenceText: Text;
  private sequenceCheckMark: CheckMark;

  private tightText: Text;
  private tightCheckMark: CheckMark;

  private threeSpadeReversalText: Text;
  private threeSpadeReversalCheckMark: CheckMark;

  private threeClubsStartText: Text;
  private threeClubsStartCheckMark: CheckMark;

  private elevenBackText: Text;
  private elevenBackCheckMark: CheckMark;

  private handleClose = () => {};

  constructor() {
    super();

    const textStyle: Partial<PIXI.ITextStyle> = {
      fill: Color.WHITE,
      stroke: Color.BLACK,
      strokeThickness: 3,
    };

    this.frame = this.createFrame();
    this.crossButton = this.createCrossButton();
    this.revolutionText = new Text("revolution", textStyle);
    this.revolutionCheckMark = this.createRevolutionCheckMark();
    this.eightStopText = new Text("eight stop", textStyle);
    this.eightStopCheckMark = this.createEightStopCheckMark();
    this.sequenceText = new Text("sequence", textStyle);
    this.sequenceCheckMark = this.createSequenceCheckMark();
    this.tightText = new Text("tight", textStyle);
    this.tightCheckMark = this.createTightCheckMark();
    this.threeSpadeReversalText = new Text("three spade reversal", textStyle);
    this.threeSpadeReversalCheckMark = this.createThreeSpadeReversalCheckMark();
    this.threeClubsStartText = new Text("three of clubs start", textStyle);
    this.threeClubsStartCheckMark = this.createThreeClubsStartCheckMark();
    this.elevenBackText = new Text("eleven back", textStyle);
    this.elevenBackCheckMark = this.createElevenBackCheckMark();

    this.layout();
    this.draw();
  }

  private layout() {
    this.layoutRevolutionText();
    this.layoutRevolutionCheckMark();
    this.layoutEightStopText();
    this.layoutEightStopCheckMark();
    this.layoutSequenceText();
    this.layoutSequenceCheckMark();
    this.layoutTightText();
    this.layoutTightCheckMark();
    this.layoutThreeSpadeReversalText();
    this.layoutThreeSpadeReversalCheckMark();
    this.layoutThreeClubsStartText();
    this.layoutThreeClubsStartCheckMark();
    this.layoutElevenBackText();
    this.layoutElevenBackCheckMark();
  }

  private layoutElevenBackText() {
    this.elevenBackText.x = this.revolutionText.x;
    this.elevenBackText.y = this.threeClubsStartText.y + Application.spacing(5);
  }

  private layoutElevenBackCheckMark() {
    this.elevenBackCheckMark.x = this.revolutionCheckMark.x;
    this.elevenBackCheckMark.y = this.elevenBackText.y;
  }

  private createElevenBackCheckMark() {
    const checkMark = new CheckMark();
    checkMark.onClick((checked: boolean) => {
      const socket = Application.shared.socket;
      socket.emit("options-eleven-back", checked);
    });
    return checkMark;
  }

  private layoutThreeClubsStartText() {
    this.threeClubsStartText.x = this.revolutionText.x;
    this.threeClubsStartText.y =
      this.threeSpadeReversalText.y + Application.spacing(5);
  }

  private layoutThreeClubsStartCheckMark() {
    this.threeClubsStartCheckMark.x = this.threeSpadeReversalCheckMark.x;
    this.threeClubsStartCheckMark.y = this.threeClubsStartText.y;
  }

  private createThreeClubsStartCheckMark() {
    const checkMark = new CheckMark();
    checkMark.onClick((checked: boolean) => {
      const socket = Application.shared.socket;
      socket.emit("options-three-clubs-start", checked);
    });
    return checkMark;
  }

  private layoutThreeSpadeReversalCheckMark() {
    this.threeSpadeReversalCheckMark.x = this.tightCheckMark.x;
    this.threeSpadeReversalCheckMark.y = this.threeSpadeReversalText.y;
  }

  private layoutThreeSpadeReversalText() {
    this.threeSpadeReversalText.x = this.revolutionText.x;
    this.threeSpadeReversalText.y = this.tightText.y + Application.spacing(5);
  }

  private createThreeSpadeReversalCheckMark() {
    const checkMark = new CheckMark();
    checkMark.onClick((checked: boolean) => {
      const socket = Application.shared.socket;
      socket.emit("options-three-spade-reversal", checked);
    });
    return checkMark;
  }

  private layoutTightText() {
    this.tightText.x = this.revolutionText.x;
    this.tightText.y = this.sequenceText.y + Application.spacing(5);
  }

  private layoutTightCheckMark() {
    this.tightCheckMark.x = this.sequenceCheckMark.x;
    this.tightCheckMark.y = this.tightText.y;
  }

  private createTightCheckMark() {
    const checkMark = new CheckMark();
    checkMark.onClick((checked: boolean) => {
      const socket = Application.shared.socket;
      socket.emit("options-tight", checked);
    });
    return checkMark;
  }

  private layoutSequenceText() {
    this.sequenceText.x = this.revolutionText.x;
    this.sequenceText.y = this.eightStopText.y + Application.spacing(5);
  }

  private layoutSequenceCheckMark() {
    this.sequenceCheckMark.x = this.revolutionCheckMark.x;
    this.sequenceCheckMark.y = this.sequenceText.y;
  }

  private createSequenceCheckMark() {
    const checkMark = new CheckMark();
    checkMark.onClick((checked: boolean) => {
      const socket = Application.shared.socket;
      socket.emit("options-sequence", checked);
    });
    return checkMark;
  }

  private createRevolutionCheckMark() {
    const checkMark = new CheckMark();
    checkMark.onClick((checked: boolean) => {
      const socket = Application.shared.socket;
      socket.emit("options-revolution", checked);
    });
    return checkMark;
  }

  private createEightStopCheckMark() {
    const checkMark = new CheckMark();
    checkMark.onClick((checked: boolean) => {
      const socket = Application.shared.socket;
      socket.emit("options-eight-stop", checked);
    });
    return checkMark;
  }

  private layoutEightStopText() {
    this.eightStopText.x = this.revolutionText.x;
    this.eightStopText.y = this.revolutionText.y + Application.spacing(5);
  }

  private layoutEightStopCheckMark() {
    this.eightStopCheckMark.x = this.revolutionCheckMark.x;
    this.eightStopCheckMark.y = this.eightStopText.y;
  }

  private layoutRevolutionCheckMark() {
    this.revolutionCheckMark.x =
      TycoonOptionsEditor.WIDTH -
      this.revolutionCheckMark.width -
      Application.spacing(3);
    this.revolutionCheckMark.y = this.revolutionText.y;
  }

  private layoutRevolutionText() {
    this.revolutionText.x = Application.spacing(3);
    this.revolutionText.y = Application.spacing(3);
  }

  private draw() {
    this.addChild(this.frame);
    this.addChild(this.crossButton);
    this.addChild(this.revolutionText);
    this.addChild(this.revolutionCheckMark);
    this.addChild(this.eightStopText);
    this.addChild(this.eightStopCheckMark);
    this.addChild(this.sequenceText);
    this.addChild(this.sequenceCheckMark);
    this.addChild(this.tightText);
    this.addChild(this.tightCheckMark);
    this.addChild(this.threeSpadeReversalText);
    this.addChild(this.threeSpadeReversalCheckMark);
    this.addChild(this.threeClubsStartText);
    this.addChild(this.threeClubsStartCheckMark);
    this.addChild(this.elevenBackText);
    this.addChild(this.elevenBackCheckMark);
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
}

class TycoonOptionsText extends Container {
  private labelText: Text;

  private revolutionText: Text;
  private eightStopText: Text;
  private sequenceText: Text;
  private tightText: Text;
  private threeSpadeReversalText: Text;
  private threeClubsStartText: Text;
  private elevenBackText: Text;

  constructor() {
    super();

    const textStyle: Partial<PIXI.ITextStyle> = {
      fill: Color.WHITE,
      fontSize: 16,
    };

    this.labelText = new Text("Custom Settings", textStyle);
    this.revolutionText = new Text("revolution: no", textStyle);
    this.eightStopText = new Text("eight stop: no", textStyle);
    this.sequenceText = new Text("sequence (kaidan): no", textStyle);
    this.tightText = new Text("tight (shibari): no", textStyle);
    this.threeSpadeReversalText = new Text(
      "three spade reversal: no",
      textStyle
    );
    this.threeClubsStartText = new Text("three of clubs start: no", textStyle);
    this.elevenBackText = new Text("eleven back: no", textStyle);

    this.layout();
    this.draw();
  }

  private layout() {
    this.revolutionText.y = Application.spacing(3);
    this.eightStopText.y = this.revolutionText.y + Application.spacing(2);
    this.sequenceText.y = this.eightStopText.y + Application.spacing(2);
    this.tightText.y = this.sequenceText.y + Application.spacing(2);
    this.threeSpadeReversalText.y = this.tightText.y + Application.spacing(2);
    this.threeClubsStartText.y =
      this.threeSpadeReversalText.y + Application.spacing(2);
    this.elevenBackText.y = this.threeClubsStartText.y + Application.spacing(2);
  }

  private draw() {
    this.addChild(this.labelText);
    this.addChild(this.revolutionText);
    this.addChild(this.eightStopText);
    this.addChild(this.sequenceText);
    this.addChild(this.tightText);
    this.addChild(this.threeSpadeReversalText);
    this.addChild(this.threeClubsStartText);
    this.addChild(this.elevenBackText);
  }

  public updateTycoonOptions(tycoonOptions: TycoonOptions) {
    this.revolutionText.text = `revolution: ${
      tycoonOptions.revolution ? "yes" : "no"
    }`;
    this.eightStopText.text = `eight stop: ${
      tycoonOptions.eightStop ? "yes" : "no"
    }`;
    this.sequenceText.text = `sequence (kaidan): ${
      tycoonOptions.sequence ? "yes" : "no"
    }`;
    this.tightText.text = `tight (shibari): ${
      tycoonOptions.tight ? "yes" : "no"
    }`;
    this.threeSpadeReversalText.text = `three spade reversal: ${
      tycoonOptions.threeSpadeReversal ? "yes" : "no"
    }`;
    this.threeClubsStartText.text = `three of clubs start: ${
      tycoonOptions.threeClubsStart ? "yes" : "no"
    }`;
    this.elevenBackText.text = `eleven back: ${
      tycoonOptions.elevenBack ? "yes" : "no"
    }`;
  }
}

class RoomViewController extends ViewController {
  private labelText: Text;
  private numPeopleText: Text;
  private startButton: Button;
  private leaveButton: Button;
  private settingsButton: Button;
  private tycoonOptionsText: TycoonOptionsText;
  private tycoonOptionsEditorPopup: Popup;

  constructor() {
    super();
    this.labelText = new Text("", { fill: Color.WHITE });
    this.numPeopleText = new Text("", { fill: Color.WHITE });
    this.startButton = this.createStartButton();
    this.leaveButton = this.createLeaveButton();
    this.settingsButton = this.createSettingsButton();
    this.tycoonOptionsText = new TycoonOptionsText();
    this.tycoonOptionsEditorPopup = this.createTycoonOptionsEditorPopup();

    this.layout();
    this.draw();

    this.addEventListeners();
  }

  private draw() {
    this.drawLabelText();
    this.drawNumPeopleText();
    this.drawLeaveButton();
    this.drawStartButton();
    this.drawTycoonOptionsText();
    this.drawSettingsButton();
  }

  private createTycoonOptionsEditorPopup() {
    const editor = new TycoonOptionsEditor();

    editor.x = Application.WIDTH / 2;
    editor.y = Application.HEIGHT / 2;
    editor.setCenterAsOrigin();

    const popup = new Popup(editor);
    editor.onClose(() => {
      this.removeChild(popup);
    });
    return popup;
  }

  private createSettingsButton() {
    const button = new Button("⚙️");
    button.onPointerDown(() => {
      this.addChild(this.tycoonOptionsEditorPopup);
    });
    return button;
  }

  private createStartButton() {
    const button = new Button("start ▶");
    button.disable();
    button.on("click", () => {
      const socket = Application.shared.socket;
      socket.emit("start");
    });
    return button;
  }

  private layout() {
    this.layoutLabelText();
    this.layoutSettingsButton();
    this.layoutNumPeopleText();
    this.layoutStartButton();
    this.layoutLeaveButton();
    this.layoutTycoonOptionsText();
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

  private layoutTycoonOptionsText() {
    this.tycoonOptionsText.x = Application.spacing(3);
    this.tycoonOptionsText.y = Application.spacing(3);
  }

  private drawTycoonOptionsText() {
    this.addChild(this.tycoonOptionsText);
  }

  private drawStartButton() {
    this.addChild(this.startButton);
  }

  private addEventListeners() {
    const socket = Application.shared.socket;

    socket.on("start-game", (options: TycoonOptions) => {
      this.loadViewController(new TycoonViewController(options));
    });

    socket.on("room-status", (roomJson: RoomJson) => {
      this.labelText.text = `🏠 Room ${roomJson.index} 🏠 `;

      this.numPeopleText.text = `${roomJson.numPlayers}/${roomJson.capacity} 👤`;

      if (roomJson.numPlayers === roomJson.capacity) {
        this.startButton.enable();
        this.numPeopleText.tint = Color.GREEN;
      } else {
        this.startButton.disable();
        this.numPeopleText.tint = Color.RED;
      }

      this.tycoonOptionsText.updateTycoonOptions(roomJson.options);
    });
  }

  private drawLabelText() {
    this.addChild(this.labelText);
  }

  private layoutLabelText() {
    this.labelText.anchor.set(0.5);
    this.labelText.x = Application.WIDTH / 2;
    this.labelText.y = Application.spacing(5);
  }

  private drawNumPeopleText() {
    this.addChild(this.numPeopleText);
  }

  private layoutNumPeopleText() {
    this.numPeopleText.anchor.set(0.5);
    this.numPeopleText.x = Application.WIDTH / 2;
    this.numPeopleText.y =
      Application.HEIGHT - this.numPeopleText.height - Application.spacing(3);
  }

  private drawLeaveButton() {
    this.addChild(this.leaveButton);
  }

  private layoutLeaveButton() {
    this.leaveButton.x = Application.spacing(3);
    this.leaveButton.y =
      Application.HEIGHT - this.leaveButton.height - Application.spacing(3);
  }

  private createLeaveButton() {
    const button = new Button("leave ❌");
    button.on("pointerdown", this.handleLeaveButtonPointerDown);
    return button;
  }

  private handleLeaveButtonPointerDown = () => {
    this.loadViewController(new LobbyViewController());
    const socket = Application.shared.socket;
    socket.emit("leave-room");
  };

  protected cleanUp() {
    super.cleanUp();
    const socket = Application.shared.socket;
    socket.off("start-game");
    socket.off("room-status");
  }
}

export default RoomViewController;
