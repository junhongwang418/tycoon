import * as PIXI from "pixi.js";
import PIXISound from "pixi-sound";
import io from "socket.io-client";
import Button from "./Button";
import Card from "./Card";
import Color from "./Color";
import Text from "./Text";
import Validator from "./Validator";

class Tycoon {
  private stage: PIXI.Container;
  private socket: SocketIOClient.Socket;

  private cards: Card[];
  private lastCards: Card[];

  private isMyTurn: boolean;
  private turnText: PIXI.Text;

  private playButton: Button;
  private passButton: Button;

  private validator: Validator;

  constructor(stage: PIXI.Container) {
    this.stage = stage;
    this.socket = io();
    this.isMyTurn = false;
    this.cards = [];
    this.lastCards = [];
    this.validator = new Validator();
  }

  public start() {
    this.draw();
    this.addEventListeners();
  }

  private addEventListeners() {
    this.stage.on("click", this.handleStageClick);
    this.socket.on("init", this.handleSocketInit);
    this.socket.on("update", this.handleSocketUpdate);
    this.socket.on("lose", this.handleSocketLose);
    this.playButton.on("click", this.handleSubmitButtonClick);
    this.passButton.on("click", this.handlePassButtonClick);
  }

  private handleSocketLose = () => {
    this.disableCardInteraction();
    this.playButton.disable();
    this.passButton.disable();
    this.turnText.text = "You lost";
  };

  private handlePassButtonClick = () => {
    if (!this.isMyTurn) return;
    this.cards.forEach((card) => card.deselect());
    this.socket.emit("submit", []);

    this.undrawLastCards();
    this.lastCards = [];

    this.isMyTurn = false;
    this.disableCardInteraction();
    this.playButton.disable();
    this.passButton.disable();
    this.updateTurnText();
  };

  private handleSubmitButtonClick = () => {
    if (!this.isMyTurn) return;
    const selectedCards = this.cards.filter((card) => card.isSelected());
    const selectedCardJsons = selectedCards.map((card) => card.toJson());
    this.socket.emit("submit", selectedCardJsons);
    this.undrawCards();
    this.cards = this.cards.filter((card) => !card.isSelected());
    this.drawCards();

    this.undrawLastCards();
    this.lastCards = selectedCards;
    this.drawLastCards();

    this.isMyTurn = false;
    this.disableCardInteraction();
    this.playButton.disable();
    this.passButton.disable();
    this.updateTurnText();

    const sound = PIXISound.Sound.from("cardPlace1.ogg");
    sound.play();

    if (this.cards.length === 0) {
      this.socket.emit("win");
      this.turnText.text = "You Won!";
    }
  };

  private handleSocketUpdate = (lastCardJsons) => {
    this.undrawLastCards();
    this.lastCards = lastCardJsons.map((json) => Card.fromJson(json));
    this.drawLastCards();
    this.isMyTurn = true;
    this.enableCardInteraction();
    this.passButton.enable();
    this.updateTurnText();
  };

  private handleSocketInit = ({ cardJsons, isMyTurn }) => {
    this.undrawCards();
    this.undrawLastCards();

    this.isMyTurn = isMyTurn;
    this.cards = cardJsons.map((json) => Card.fromJson(json));
    this.cards.sort(Card.comparator);
    this.drawCards();
    this.updateTurnText();

    if (!this.isMyTurn) {
      this.disableCardInteraction();
      this.playButton.disable();
      this.passButton.disable();
    }
  };

  private isCardSelectionValid() {
    const selectedCards = this.cards.filter((card) => card.isSelected());
    return this.validator.isTransitionValid(this.lastCards, selectedCards);
  }

  private handleStageClick = () => {
    if (this.isCardSelectionValid()) {
      this.playButton.enable();
    } else {
      this.playButton.disable();
    }
  };

  private draw() {
    this.drawSubmitButton();
    this.drawPassButton();
    this.drawTurnText();
  }

  private drawSubmitButton() {
    this.playButton = new Button("play");
    this.playButton.disable();
    this.playButton.x = 400;
    this.playButton.y = 400;
    this.stage.addChild(this.playButton);
  }

  private drawPassButton() {
    this.passButton = new Button("pass");
    this.passButton.x = 700;
    this.passButton.y = 400;
    this.stage.addChild(this.passButton);
  }

  private drawTurnText() {
    this.turnText = new Text("", {
      fill: Color.WHITE,
    });
    this.turnText.x = 100;
    this.stage.addChild(this.turnText);
  }

  private drawCards() {
    const circleRadius = 800;
    const circleCenterX = 640;
    const circleCenterY = 720 + circleRadius - 100;

    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      const startRadian = (-Math.PI / 64) * (this.cards.length / 2);
      const endRadian = -startRadian;
      const step = (endRadian - startRadian) / this.cards.length;
      const radian = startRadian + step * i;
      card.rotation = radian;
      card.x = circleCenterX + circleRadius * Math.sin(radian);
      card.y = circleCenterY - circleRadius * Math.cos(radian);
      this.stage.addChild(card);
    }
  }

  private undrawCards() {
    this.cards.forEach((card) => this.stage.removeChild(card));
  }

  private drawLastCards() {
    for (let i = 0; i < this.lastCards.length; i++) {
      const card = this.lastCards[i];
      card.rotation = 0;
      card.x = 500 + i * 30;
      card.y = 250;
      this.stage.addChild(card);
    }
  }

  private undrawLastCards() {
    this.lastCards.forEach((card) => this.stage.removeChild(card));
  }

  private updateTurnText() {
    if (this.isMyTurn) {
      this.turnText.text = "Your Turn 🙌";
    } else {
      this.turnText.text = "Their Turn　🤔🤔🤔";
    }
  }

  private disableCardInteraction() {
    this.cards.forEach((card) => (card.interactive = false));
  }

  private enableCardInteraction() {
    this.cards.forEach((card) => (card.interactive = true));
  }
}

export default Tycoon;
