import { Socket } from "socket.io";
import { RoomJson } from "../common/Room";
import { TycoonOptions, TycoonUtil } from "../common/Tycoon";
import Lobby from "./Lobby";
import Tycoon from "./Tycoon";

interface SocketCallbackBundle {
  onRoomLeaveHandler: () => void;
  onDisconnectHandler: () => void;
}

export interface RoomParams {
  id: string;
  capacity: number;
}

class Room {
  public static readonly ID_LENGTH = 5;

  private id: string;
  private capacity: number;
  private host: Socket;
  private guests: { [id: string]: Socket };
  private socketCallbackBundles: { [id: string]: SocketCallbackBundle };

  private tycoonOptions: TycoonOptions;

  constructor(params: RoomParams) {
    const { id, capacity } = params;
    this.id = id;
    this.capacity = capacity;
    this.host = null;
    this.guests = {};
    this.socketCallbackBundles = {};
    this.tycoonOptions = TycoonUtil.createDefaultTycoonOptions();
  }

  public setId(id: string) {
    this.id = id;
  }

  public addSocket(socket: Socket) {
    if (this.isFull()) return;

    // first socket is host
    if (this.host == null) {
      this.host = socket;
    } else {
      this.guests[socket.id] = socket;
    }

    const onRoomLeaveHandler = () => this.handleSocketRoomLeave(socket);
    const onDisconnectHandler = () => this.handleSocketDisconnect(socket);

    socket.on("room-leave", onRoomLeaveHandler);
    socket.on("room-start", this.handleSocketRoomStart);
    socket.on(
      "room-tycoon-options-update",
      this.handleSocketRoomTycoonOptionsUpdate
    );
    socket.on("disconnect", onDisconnectHandler);

    this.emitRoomStatusUpdateToAllSockets();

    this.socketCallbackBundles[socket.id] = {
      onRoomLeaveHandler,
      onDisconnectHandler,
    };
  }

  private handleSocketRoomLeave = (socket: Socket) => {
    const isHost = socket.id === this.host.id;
    this.removeSocket(socket);
    Lobby.shared.addSocket(socket);

    if (isHost) {
      Object.values(this.guests).forEach((guest) => {
        this.removeSocket(guest);
        Lobby.shared.addSocket(guest);
      });
      Lobby.shared.removeRoom(this.id);
    } else {
      this.emitRoomStatusUpdateToAllSockets();
    }
  };

  private handleSocketRoomTycoonOptionsUpdate = (
    tycoonOptions: TycoonOptions
  ) => {
    this.tycoonOptions = tycoonOptions;
    Object.values(this.guests).forEach((guest) =>
      guest.emit("room-status-update", this.toJson())
    );
  };

  private handleSocketRoomStart = () => {
    if (!this.isFull()) return;
    this.getSockets().forEach((socket) => {
      socket.emit("room-start-success", this.tycoonOptions);
    });

    const tycoon = new Tycoon(this.getSockets());
    tycoon.start();
  };

  private handleSocketDisconnect = (socket: Socket) => {
    const isHost = socket.id === this.host.id;
    this.removeSocket(socket);

    if (isHost) {
      Object.values(this.guests).forEach((guest) => {
        this.removeSocket(guest);
        Lobby.shared.addSocket(guest);
        guest.emit("room-host-leave");
      });
      Lobby.shared.removeRoom(this.id);
    } else {
      this.host.emit("room-guest-leave", this.toJson());
      this.emitRoomStatusUpdateToAllSockets();
    }
  };

  private removeSocket(socket: Socket) {
    const {
      onRoomLeaveHandler,
      onDisconnectHandler,
    } = this.socketCallbackBundles[socket.id];

    socket.off("room-leave", onRoomLeaveHandler);
    socket.off("room-start", this.handleSocketRoomStart);
    socket.off(
      "room-tycoon-options-update",
      this.handleSocketRoomTycoonOptionsUpdate
    );
    socket.off("disconnect", onDisconnectHandler);

    if (this.host && socket.id === this.host.id) {
      this.host = null;
    } else {
      delete this.guests[socket.id];
    }

    delete this.socketCallbackBundles[socket.id];
  }

  public isFull() {
    return this.getSockets().length >= this.capacity;
  }

  public toJson(): RoomJson {
    return {
      id: this.id,
      numPlayers: this.getSockets().length,
      capacity: this.capacity,
      options: this.tycoonOptions,
    };
  }

  private getSockets() {
    return [this.host, ...Object.values(this.guests)];
  }

  private emitRoomStatusUpdateToAllSockets() {
    this.getSockets().forEach((socket) => {
      socket.emit("room-status-update", this.toJson());
    });
  }
}

export default Room;
