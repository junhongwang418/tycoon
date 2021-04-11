import { Socket } from "socket.io";
import { TycoonOptions } from "../common/Tycoon";
import Lobby from "./Lobby";
import Tycoon from "./Tycoon";

export interface RoomJson {
  index: number;
  numPlayers: number;
  capacity: number;
  options: TycoonOptions;
}

class Room {
  private static readonly CAPACITY = 2;

  private sockets: Socket[];
  private readySet: Set<string>;
  private index: number;

  private tycoon: Tycoon;
  private tycoonOptions: TycoonOptions;

  constructor(index: number) {
    this.index = index;
    this.sockets = [];
    this.readySet = new Set();
    this.tycoon = null;
    this.tycoonOptions = {
      revolution: false,
      eightStop: false,
      sequence: false,
      tight: false,
      threeSpadeReversal: false,
      threeClubsStart: false,
      elevenBack: false,
    };
    this.broadcastStatusEverySecond();
  }

  public addSocket(socket: Socket) {
    if (this.isFull()) return;

    this.sockets.push(socket);

    socket.emit("enter-room");

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

    socket.on("start", () => {
      if (this.isFull()) {
        this.sockets.forEach((socket) =>
          socket.emit("start-game", this.tycoonOptions)
        );
      }
    });

    socket.on("options-eleven-back", (checked: boolean) => {
      this.tycoonOptions.elevenBack = checked;
    });

    socket.on("options-three-clubs-start", (checked: boolean) => {
      this.tycoonOptions.threeClubsStart = checked;
    });

    socket.on("options-three-spade-reversal", (checked: boolean) => {
      this.tycoonOptions.threeSpadeReversal = checked;
    });

    socket.on("options-tight", (checked: boolean) => {
      this.tycoonOptions.tight = checked;
    });

    socket.on("options-sequence", (checked: boolean) => {
      this.tycoonOptions.sequence = checked;
    });

    socket.on("options-revolution", (checked: boolean) => {
      this.tycoonOptions.revolution = checked;
    });

    socket.on("options-eight-stop", (checked: boolean) => {
      this.tycoonOptions.eightStop = checked;
    });
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

  public toJson(): RoomJson {
    return {
      index: this.index,
      numPlayers: this.sockets.length,
      capacity: Room.CAPACITY,
      options: this.tycoonOptions,
    };
  }

  private broadcastStatusEverySecond() {
    const oneSecondInMilliseonds = 1000;
    setInterval(() => {
      this.sockets.forEach((socket) => {
        socket.emit("room-status", this.toJson());
      });
    }, oneSecondInMilliseonds);
  }
}

export default Room;
