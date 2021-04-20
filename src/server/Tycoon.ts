import CardDeck from "./CardDeck";
import { Socket } from "socket.io";
import { SocketInitSuccessData } from "../common/Tycoon";
import { CardJson } from "../common/Card";

interface SocketCallbackBundle {
  onTycoonInitHandler: () => void;
  onTycoonActionHandler: (selectedCardJsons: CardJson[]) => void;
}

class Tycoon {
  private static readonly NUM_CARDS_PER_PLAYER = 16;

  private sockets: Socket[];
  private cardDeck: CardDeck;
  private socketCallbackBundles: { [id: string]: SocketCallbackBundle };

  constructor(sockets: Socket[]) {
    this.sockets = sockets;
    this.cardDeck = this.createCardDeck();
    this.socketCallbackBundles = {};
  }

  public start() {
    this.addEventListeners();
  }

  public quit() {
    this.removeEventListeners();
  }

  private createCardDeck() {
    const cardDeck = new CardDeck();
    cardDeck.shuffle();
    return cardDeck;
  }

  private addEventListeners() {
    this.sockets.forEach((socket) => {
      const onTycoonInitHandler = () => this.handleSocketTycoonInit(socket);
      const onTycoonActionHandler = (selectedCardJsons: CardJson[]) =>
        this.handleSocketTycoonAction(socket, selectedCardJsons);

      socket.on("tycoon-init", onTycoonInitHandler);
      socket.on("tycoon-action", onTycoonActionHandler);
      socket.on("tycoon-quit", this.handleSocketTycoonQuit);
      socket.on("disconnect", this.handleSocketDisconnect);

      this.socketCallbackBundles[socket.id] = {
        onTycoonInitHandler,
        onTycoonActionHandler,
      };
    });
  }

  private handleSocketTycoonInit = (socket: Socket) => {
    const cards = this.cardDeck.drawMany(Tycoon.NUM_CARDS_PER_PLAYER);
    const data: SocketInitSuccessData = {
      cardJsons: cards.map((card) => card.toJson()),
      myTurn: this.sockets.findIndex((s) => s.id === socket.id),
    };
    socket.emit("tycoon-init-success", data);
  };

  private handleSocketTycoonAction = (
    socket: Socket,
    selectedCardJsons: CardJson[]
  ) => {
    const otherSockets = this.sockets.filter((s) => s.id !== socket.id);
    otherSockets.forEach((s) => s.emit("tycoon-update", selectedCardJsons));
  };

  private handleSocketDisconnect = () => {
    this.quit();
  };

  private handleSocketTycoonQuit = () => {
    this.quit();
  };

  private removeEventListeners() {
    this.sockets.forEach((socket) => {
      const {
        onTycoonInitHandler,
        onTycoonActionHandler,
      } = this.socketCallbackBundles[socket.id];

      socket.off("tycoon-init", onTycoonInitHandler);
      socket.off("tycoon-action", onTycoonActionHandler);
      socket.off("tycoon-quit", this.handleSocketTycoonQuit);
      socket.off("disconnect", this.handleSocketDisconnect);

      delete this.socketCallbackBundles[socket.id];
    });
  }
}

export default Tycoon;
