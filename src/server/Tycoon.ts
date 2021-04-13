import CardDeck from "./CardDeck";
import { Socket } from "socket.io";
import { TycoonOptions } from "../common/Tycoon";

class Tycoon {
  private player1Socket: Socket;
  private player2Socket: Socket;

  constructor(player1Socket: Socket, player2Socket: Socket) {
    this.player1Socket = player1Socket;
    this.player2Socket = player2Socket;
  }

  public start() {
    const cardDeck = new CardDeck();
    cardDeck.shuffle();

    const player1Cards = cardDeck.drawMany(16);
    const player2Cards = cardDeck.drawMany(16);

    this.player1Socket.on("init", () => {
      this.player1Socket.emit("init-success", {
        cardJsons: player1Cards.map((card) => card.toJson()),
        isMyTurn: true,
      });
    });

    this.player2Socket.on("init", () => {
      this.player2Socket.emit("init-success", {
        cardJsons: player2Cards.map((card) => card.toJson()),
        isMyTurn: false,
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
    });

    this.player2Socket.on("win", () => {
      this.player1Socket.emit("lose");
    });
  }
}

export default Tycoon;
