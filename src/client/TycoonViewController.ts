import * as PIXI from "pixi.js";
import PIXISound from "pixi-sound";
import Button from "./Button";
import Card from "./Card";
import Color from "./Color";
import Text from "./Text";
import Validator from "./Validator";
import Application from "./Application";
import ViewController from "./ViewController";
import RoomSelectionViewController from "./LobbyViewController";
import Popup from "./Popup";
import Sound from "./Sound";
import { CardJson } from "../common/Card";
import Container from "./Container";
import { TycoonOptions } from "../common/Tycoon";

class Alert extends Container {
  private static get WIDTH() {
    return (Application.WIDTH * 2) / 3;
  }

  private static get HEIGHT() {
    return (Application.HEIGHT * 2) / 3;
  }

  private handleOk = () => {};

  private frame: PIXI.Graphics;
  private messageText: Text;
  private okButton: Button;

  constructor(text: string) {
    super();
    this.frame = this.createFrame();
    this.messageText = new Text(text, { fill: Color.WHITE });
    this.okButton = this.createOkButton();
    this.layout();
    this.draw();
  }

  private draw() {
    this.addChild(this.frame);
    this.addChild(this.messageText);
    this.addChild(this.okButton);
  }

  private layout() {
    this.layoutFrame();
    this.layoutMessageText();
    this.layoutOkButton();
  }

  private layoutFrame() {
    this.frame.x = (Application.WIDTH - this.frame.width) / 2;
    this.frame.y = (Application.HEIGHT - this.frame.height) / 2;
  }

  private layoutOkButton() {
    this.okButton.setCenterAsOrigin();
    this.okButton.x = Application.WIDTH / 2;
    this.okButton.y = Application.HEIGHT / 2 + Application.spacing(5);
  }

  private createOkButton() {
    const button = new Button("ok");
    button.onPointerDown(() => this.handleOk());
    return button;
  }

  private layoutMessageText() {
    this.messageText.anchor.set(0.5);
    this.messageText.x = Application.WIDTH / 2;
    this.messageText.y = Application.HEIGHT / 2 - Application.spacing(5);
  }

  private createFrame() {
    const frame = new PIXI.Graphics();
    frame.lineStyle(1, Color.WHITE);
    frame.beginFill(Color.BLACK);
    frame.drawRect(0, 0, Alert.WIDTH, Alert.HEIGHT);
    frame.endFill();
    return frame;
  }

  public onOk(cb: () => void) {
    this.handleOk = cb;
  }
}

class TycoonViewController extends ViewController {
  private myCards: Card[];
  private playedCards: Card[][];

  private isMyTurn: boolean;
  private validator: Validator;

  private promptText: Text;
  private actionButton: Button;

  constructor(tycoonOptions: TycoonOptions) {
    super();

    this.isMyTurn = false;
    this.myCards = [];
    this.playedCards = [];
    this.validator = new Validator(tycoonOptions);
    this.promptText = new Text("", { fill: Color.WHITE });
    this.actionButton = this.createActionButton();

    this.layout();
    this.draw();
    this.enableInteraction();
    this.addEventListeners();
  }

  private enableInteraction() {
    this.interactive = true;
    this.hitArea = new PIXI.Rectangle(
      0,
      0,
      Application.WIDTH,
      Application.HEIGHT
    );
  }

  private createActionButton() {
    const button = new Button("pass");
    button.disable();
    button.onPointerDown(this.handleActionButtonPointerDown);
    return button;
  }

  private layout() {
    this.layoutPromptText();
    this.layoutActionButton();
  }

  private layoutPromptText() {
    this.promptText.anchor.set(0.5);
    this.promptText.x = Application.WIDTH / 2;
    this.promptText.y = Application.spacing(5);
  }

  private layoutActionButton() {
    this.actionButton.setCenterAsOrigin();
    this.actionButton.x = Application.WIDTH / 2;
    this.actionButton.y = Application.HEIGHT / 2 + Application.spacing(5);
  }

  private addEventListeners() {
    this.on("pointerdown", this.handlePointerDown);

    const socket = Application.shared.socket;
    socket.on("init", this.handleSocketInit);
    socket.on("update", this.handleSocketUpdate);
    socket.on("lose", this.handleSocketLose);
    socket.on("leave", this.handleSocketLeave);
    socket.emit("ready");
  }

  private handleActionButtonPointerDown = () => {
    const selectedCards = this.myCards.filter((card) => card.isSelected());
    const selectedCardJsons = selectedCards.map((card) => card.toJson());

    const socket = Application.shared.socket;
    socket.emit("action", selectedCardJsons);

    this.myCards = this.myCards.filter((card) => !card.isSelected());
    this.layoutMyCards();

    const isPass = selectedCards.length === 0;
    if (isPass) {
      this.playedCards.forEach((cards) => this.removeChild(...cards));
      this.playedCards = [];
    } else {
      this.playedCards.push(selectedCards);
      selectedCards.forEach((card) => {
        this.removeChild(card);
        this.addChild(card);
        card.interactive = false;
      });
      this.layoutSelectedCards(selectedCards);
    }

    this.isMyTurn = false;
    this.disableMyCardsInteraction();
    this.updatePromptTextBasedOnMyTurn();
    this.updateActionButton();

    Sound.play("cardPlace1.ogg");

    if (this.myCards.length === 0) {
      const socket = Application.shared.socket;
      socket.emit("win");
      this.promptText.text = "You Won!";
    }
  };

  private layoutSelectedCards(cards: Card[]) {
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      card.rotation = Math.random() * Math.PI * 2;
      card.x = Application.WIDTH / 2 + i * 30;
      card.y = Application.HEIGHT / 2 - card.height / 2;
    }
  }

  private handleSocketLeave = () => {
    this.drawForceQuitPopup();
  };

  protected cleanUp() {
    const socket = Application.shared.socket;
    socket.off("init", this.handleSocketInit);
    socket.off("update", this.handleSocketUpdate);
    socket.off("lose", this.handleSocketLose);
    socket.off("leave", this.handleSocketLeave);
  }

  private drawForceQuitPopup() {
    const alert = new Alert("The other player left the game :(");
    const popup = new Popup(alert);
    this.addChild(popup);
    alert.onOk(() => {
      this.loadViewController(new RoomSelectionViewController());
    });
  }

  private handleSocketLose = () => {
    this.disableMyCardsInteraction();
    this.actionButton.disable();
    this.promptText.text = "You lost";
  };

  private handleSocketUpdate = (lastCardJsons: CardJson[]) => {
    const theirSelectedCards = lastCardJsons.map((json) => Card.fromJson(json));
    theirSelectedCards.forEach((card) => (card.interactive = false));
    if (theirSelectedCards.length === 0) {
      this.playedCards.forEach((cards) => this.removeChild(...cards));
      this.playedCards = [];
    } else {
      this.addChild(...theirSelectedCards);
      this.layoutSelectedCards(theirSelectedCards);
      this.playedCards.push(theirSelectedCards);
      Sound.play("cardPlace1.ogg");
    }

    this.isMyTurn = true;
    this.enableMyCardsInteraction();
    this.updatePromptTextBasedOnMyTurn();
    this.updateActionButton();
  };

  private handleSocketInit = ({ cardJsons, isMyTurn }) => {
    this.isMyTurn = isMyTurn;
    this.myCards = cardJsons.map((json) => Card.fromJson(json));
    this.myCards.sort(Card.comparator);
    this.drawMyCards();
    this.layoutMyCards();
    this.updatePromptTextBasedOnMyTurn();
    this.updateActionButton();

    if (!this.isMyTurn) {
      this.disableMyCardsInteraction();
    }
  };

  private updatePromptTextBasedOnMyTurn() {
    if (this.isMyTurn) {
      this.promptText.text = "Your Turn 🙌";
    } else {
      this.promptText.text = "Their Turn　🤔🤔🤔";
    }
  }

  private updateActionButton() {
    if (this.isMyTurn) {
      if (this.isCardSelectionValid()) {
        this.actionButton.enable();
        if (this.getSelectedCards().length === 0) {
          this.actionButton.updateText("pass");
        } else {
          this.actionButton.updateText("play");
        }
      } else {
        this.actionButton.disable();
      }
    } else {
      this.actionButton.disable();
    }
  }

  private isCardSelectionValid() {
    const selectedCards = this.getSelectedCards();
    return this.validator.isTransitionValid(this.getPrevCards(), selectedCards);
  }

  private getSelectedCards() {
    return this.myCards.filter((card) => card.isSelected());
  }

  private getPrevCards() {
    return this.playedCards[this.playedCards.length - 1] || [];
  }

  private handlePointerDown = () => {
    if (!this.isMyTurn) return;
    this.updateActionButton();
  };

  private draw() {
    this.addChild(this.actionButton);
    this.addChild(this.promptText);
  }

  private drawMyCards() {
    this.addChild(...this.myCards);
  }

  private layoutMyCards() {
    const circleRadius = 700;
    const circleCenterX = Application.WIDTH / 2;
    const circleCenterY = Application.HEIGHT + circleRadius - 100;

    for (let i = 0; i < this.myCards.length; i++) {
      const card = this.myCards[i];
      const startRadian = (-Math.PI / 64) * (this.myCards.length / 2);
      const endRadian = -startRadian;
      const step = (endRadian - startRadian) / this.myCards.length;
      const radian = startRadian + step * i;
      card.rotation = radian;
      card.x = circleCenterX + circleRadius * Math.sin(radian);
      card.y = circleCenterY - circleRadius * Math.cos(radian);
    }
  }

  private disableMyCardsInteraction() {
    this.myCards.forEach((card) => (card.interactive = false));
  }

  private enableMyCardsInteraction() {
    this.myCards.forEach((card) => (card.interactive = true));
  }
}

export default TycoonViewController;
