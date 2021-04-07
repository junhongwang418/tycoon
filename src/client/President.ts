import * as PIXI from "pixi.js";
import io from "socket.io-client";
import Button from "./Button";
import Card from "./Card";
import Color from "./Color";

class President {
  private stage: PIXI.Container;
  private socket: SocketIOClient.Socket;

  private cards: Card[];
  private lastCards: Card[];

  private isMyTurn: boolean;
  private turnText: PIXI.Text;

  constructor(stage: PIXI.Container) {
    this.stage = stage;
    this.socket = io();
    this.isMyTurn = false;
    this.cards = [];
    this.lastCards = [];
  }

  public start() {
    this.socket.on("init", ({ cardJsons, isMyTurn }) => {
      this.undrawCards();
      this.undrawLastCards();

      this.isMyTurn = isMyTurn;
      this.cards = cardJsons.map((json) => Card.fromJson(json));
      this.cards.sort(Card.comparator);
      this.drawCards();
      this.updateTurnText();
    });

    this.socket.on("update", (lastCardJsons) => {
      this.undrawLastCards();
      this.lastCards = lastCardJsons.map((json) => Card.fromJson(json));
      this.drawLastCards();
      this.isMyTurn = true;
      this.updateTurnText();
    });

    const button = new Button("submit");

    this.stage.addChild(button);

    button.on("click", () => {
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
      this.updateTurnText();
    });

    const style = new PIXI.TextStyle({
      fill: Color.WHITE,
    });

    this.turnText = new PIXI.Text("", style);
    this.turnText.x = 100;
    this.stage.addChild(this.turnText);
  }

  private drawCards() {
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      card.x = 20 + i * 30;
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
      card.y = 200;
      this.stage.addChild(card);
    }
  }

  private undrawLastCards() {
    this.lastCards.forEach((card) => this.stage.removeChild(card));
  }

  private updateTurnText() {
    if (this.isMyTurn) {
      this.turnText.text = "Your Turn";
    } else {
      this.turnText.text = "Their Turn";
    }
  }
}

export default President;
