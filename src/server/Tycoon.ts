import CardDeck from "./CardDeck";
import { Socket } from "socket.io";
import Card from "./Card";

class Tycoon {
  private player1Socket: Socket;
  private player2Socket: Socket;

  private player1Cards: Card[];
  private player2Cards: Card[];

  constructor(player1Socket: Socket, player2Socket: Socket) {
    this.player1Socket = player1Socket;
    this.player2Socket = player2Socket;

    const cardDeck = new CardDeck();
    cardDeck.shuffle();
    this.player1Cards = cardDeck.drawMany(16);
    this.player2Cards = cardDeck.drawMany(16);
  }

  public addEventListeners() {
    this.player1Socket.on("init", () => {
      this.player1Socket.emit("init-success", {
        cardJsons: this.player1Cards.map((card) => card.toJson()),
        myTurn: 0,
      });
    });

    this.player2Socket.on("init", () => {
      this.player2Socket.emit("init-success", {
        cardJsons: this.player2Cards.map((card) => card.toJson()),
        myTurn: 1,
      });
    });

    this.player1Socket.on("action", (selectedCardJsons) => {
      this.player2Socket.emit("update", selectedCardJsons);
    });

    this.player2Socket.on("action", (selectedCardJsons) => {
      this.player1Socket.emit("update", selectedCardJsons);
    });

    this.player1Socket.on("win", () => {
      this.player2Socket.emit("lose");
      this.removeEventListeners();
    });

    this.player2Socket.on("win", () => {
      this.player1Socket.emit("lose");
      this.removeEventListeners();
    });
  }

  public removeEventListeners() {
    this.player1Socket.removeAllListeners("init");
    this.player2Socket.removeAllListeners("init");

    this.player1Socket.removeAllListeners("action");
    this.player2Socket.removeAllListeners("action");

    this.player1Socket.removeAllListeners("win");
    this.player2Socket.removeAllListeners("win");

    this.player1Socket.removeAllListeners("lose");
    this.player2Socket.removeAllListeners("lose");
  }
}

export default Tycoon;
