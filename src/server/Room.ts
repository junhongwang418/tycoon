import { Socket } from "socket.io";
import Lobby from "./Lobby";
import Tycoon from "./Tycoon";

export interface RoomJson {
  numPlayers: number;
  capacity: number;
}

class Room {
  private static readonly CAPACITY = 2;

  private sockets: Socket[];
  private readySet: Set<string>;
  private index: number;

  private tycoon: Tycoon;

  constructor(index: number) {
    this.index = index;
    this.sockets = [];
    this.readySet = new Set();
    this.tycoon = null;
  }

  public addSocket(socket: Socket) {
    if (this.isFull()) return;

    this.sockets.push(socket);

    socket.emit("enter-room", this.index);

    socket.on("leave-room", () => {
      this.removeSocket(socket);
      Lobby.shared.addSocket(socket);
    });
    socket.on("disconnect", () => {
      this.removeSocket(socket);

      if (this.tycoon) {
        this.sockets.forEach((socket) => {
          socket.emit("leave");
          this.removeSocket(socket);
          Lobby.shared.addSocket(socket);
        });
        this.sockets = [];
        this.readySet.clear();
        this.tycoon = null;
      }
    });

    socket.on("ready", () => {
      this.readySet.add(socket.id);

      if (this.readySet.size === 2) {
        this.tycoon = new Tycoon(this.sockets[0], this.sockets[1]);
        this.tycoon.start();
      }
    });

    if (this.isFull()) {
      this.sockets.forEach((socket) => socket.emit("start-game"));
    }
  }

  public removeSocket(socket: Socket) {
    this.sockets = this.sockets.filter((s) => s.id !== socket.id);
    this.readySet.delete(socket.id);
    socket.removeAllListeners("leave-room");
    socket.removeAllListeners("ready");
  }

  public isFull() {
    return this.sockets.length >= Room.CAPACITY;
  }

  public toJson() {
    return {
      numPlayers: this.sockets.length,
      capacity: Room.CAPACITY,
    };
  }
}

export default Room;
