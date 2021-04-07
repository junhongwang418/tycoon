import * as PIXI from "pixi.js";
import PIXISound from "pixi-sound";
import io from "socket.io-client";
import Button from "./Button";
import Card from "./Card";
import Color from "./Color";
import Text from "./Text";

class Tycoon {
  private stage: PIXI.Container;
  private socket: SocketIOClient.Socket;

  private cards: Card[];
  private lastCards: Card[];

  private isMyTurn: boolean;
  private turnText: PIXI.Text;

  private submitButton: Button;
  private passButton: Button;

  constructor(stage: PIXI.Container) {
    this.stage = stage;
    this.socket = io();
    this.isMyTurn = false;
    this.cards = [];
    this.lastCards = [];
  }

  public start() {
    this.draw();

    this.stage.interactive = true;
    this.stage.hitArea = new PIXI.Rectangle(0, 0, 800, 600);
    this.stage.on("click", () => {
      if (this.cards.filter((card) => card.isSelected()).length > 0) {
        this.submitButton.enable();
      } else {
        this.submitButton.disable();
      }
    });

    this.socket.on("init", ({ cardJsons, isMyTurn }) => {
      this.undrawCards();
      this.undrawLastCards();

      this.isMyTurn = isMyTurn;
      this.cards = cardJsons.map((json) => Card.fromJson(json));
      this.cards.sort(Card.comparator);
      this.drawCards();
      this.updateTurnText();

      if (!this.isMyTurn) {
        this.disableCardInteraction();
        this.submitButton.disable();
        this.passButton.disable();
      }
    });

    this.socket.on("update", (lastCardJsons) => {
      this.undrawLastCards();
      this.lastCards = lastCardJsons.map((json) => Card.fromJson(json));
      this.drawLastCards();
      this.isMyTurn = true;
      this.enableCardInteraction();
      this.passButton.enable();
      this.updateTurnText();
    });

    this.submitButton.on("click", () => {
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
      this.submitButton.disable();
      this.passButton.disable();
      this.updateTurnText();

      const sound = PIXISound.Sound.from("cardPlace1.ogg");
      sound.play();
    });

    this.passButton.on("click", () => {
      if (!this.isMyTurn) return;
      this.cards.forEach((card) => card.deselect());
      this.socket.emit("submit", []);

      this.isMyTurn = false;
      this.disableCardInteraction();
      this.submitButton.disable();
      this.passButton.disable();
      this.updateTurnText();
    });
  }

  private draw() {
    this.drawSubmitButton();
    this.drawPassButton();
    this.drawTurnText();
  }

  private drawSubmitButton() {
    this.submitButton = new Button("submit");
    this.submitButton.disable();
    this.submitButton.x = 100;
    this.submitButton.y = 300;
    this.stage.addChild(this.submitButton);
  }

  private drawPassButton() {
    this.passButton = new Button("pass");
    this.passButton.x = 300;
    this.passButton.y = 300;
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
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      card.x = 20 + i * 35;
      card.y = 400;
      this.stage.addChild(card);
    }
  }

  private undrawCards() {
    this.cards.forEach((card) => this.stage.removeChild(card));
  }

  private drawLastCards() {
    for (let i = 0; i < this.lastCards.length; i++) {
      const card = this.lastCards[i];
      card.x = 20 + i * 30;
      card.y = 80;
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
