import { Socket } from "socket.io";
import { RoomJson } from "../common/Room";
import { TycoonOptions, DEFAULT_TYCOON_OPTIONS } from "../common/Tycoon";
import Lobby from "./Lobby";
import Tycoon from "./Tycoon";

class Room {
  public static readonly ID_LENGTH = 5;
  private static readonly CAPACITY = 2;

  private id: string;
  private host: Socket;
  private guests: { [id: string]: Socket };

  private tycoon: Tycoon;
  private tycoonOptions: TycoonOptions;

  constructor(id: string) {
    this.id = id;
    this.guests = {};
    this.tycoon = null;
    this.tycoonOptions = DEFAULT_TYCOON_OPTIONS;
  }

  public addSocket(socket: Socket) {
    if (this.isFull()) return;

    // first socket is host
    if (this.host == null) {
      this.host = socket;
    } else {
      this.guests[socket.id] = socket;
    }

    socket.on("leave-room", () => {
      this.removeSocket(socket);
      Lobby.shared.addSocket(socket);

      if (socket.id === this.host.id) {
        Object.values(this.guests).forEach((guest) => {
          this.removeSocket(guest);
          Lobby.shared.addSocket(guest);
        });
        Lobby.shared.removeRoom(this.id);
      } else {
        this.broadcastRoomStatusUpdate();
      }
    });

    socket.on("disconnect", () => {
      this.removeSocket(socket);

      if (socket.id === this.host.id) {
        Object.values(this.guests).forEach((guest) => {
          this.removeSocket(guest);
          Lobby.shared.addSocket(guest);
          if (this.tycoon) {
            guest.emit("host-left-game");
          }
        });
        Lobby.shared.removeRoom(this.id);
      } else {
        if (this.tycoon) {
          this.host.emit("guest-left-game", this.id);
        }
        this.broadcastRoomStatusUpdate();
      }

      if (this.tycoon) {
        this.tycoon.removeEventListeners();
        this.tycoon = null;
      }
    });

    socket.on("start", () => {
      if (!this.isFull()) return;
      this.getSockets().forEach((socket) => {
        socket.emit("start-success", this.tycoonOptions);
      });

      this.tycoon = new Tycoon(this.host, Object.values(this.guests)[0]);
      this.tycoon.addEventListeners();
    });

    socket.on("options-update", (tycoonOptions: TycoonOptions) => {
      this.tycoonOptions = tycoonOptions;
      Object.values(this.guests).forEach((guest) =>
        guest.emit("room-status-update", this.toJson())
      );
    });

    this.broadcastRoomStatusUpdate();
  }

  public removeSocket(socket: Socket) {
    socket.removeAllListeners("leave-room");
    if (socket.id !== this.host.id) {
      delete this.guests[socket.id];
    }

    // this.sockets = this.sockets.filter((s) => s.id !== socket.id);
    // this.readySet.delete(socket.id);
    // socket.removeAllListeners("leave-room");
    // socket.removeAllListeners("ready");
  }

  public isFull() {
    return this.getSockets().length >= Room.CAPACITY;
  }

  public toJson(): RoomJson {
    return {
      id: this.id,
      numSockets: this.getSockets().length,
      capacity: Room.CAPACITY,
      options: this.tycoonOptions,
    };
  }

  private getSockets() {
    return [this.host, ...Object.values(this.guests)];
  }

  private broadcastRoomStatusUpdate() {
    this.getSockets().forEach((socket) => {
      socket.emit("room-status-update", this.toJson());
    });
  }
}

export default Room;
