import Room from "./Room";
import { Socket } from "socket.io";
import Algorithm from "../common/Algorithm";

interface SocketCallbackBundle {
  onLobbyCreateRoomHandler: () => void;
  onLobbyJoinRoomHandler: (roomId: string) => void;
  onDisconnectHandler: () => void;
}

class Lobby {
  private rooms: { [id: string]: Room };
  private socketCallbackBundles: { [id: string]: SocketCallbackBundle };

  public static readonly shared = new Lobby();

  private constructor() {
    this.rooms = {};
    this.socketCallbackBundles = {};
  }

  public addSocket(socket: Socket) {
    const onLobbyCreateRoomHandler = () =>
      this.handleSocketLobbyCreateRoom(socket);
    const onLobbyJoinRoomHandler = (roomId: string) =>
      this.handleSocketLobbyJoinRoom(socket, roomId);
    const onDisconnectHandler = () => this.handleSocketDisconnect(socket);

    socket.on("lobby-create-room", onLobbyCreateRoomHandler);
    socket.on("lobby-join-room", onLobbyJoinRoomHandler);
    socket.on("disconnect", onDisconnectHandler);

    this.socketCallbackBundles[socket.id] = {
      onLobbyCreateRoomHandler,
      onLobbyJoinRoomHandler,
      onDisconnectHandler,
    };
  }

  private handleSocketDisconnect = (socket: Socket) => {
    this.removeSocket(socket);
  };

  private handleSocketLobbyJoinRoom = (socket: Socket, roomId: string) => {
    const room = this.rooms[roomId];
    if (room && !room.isFull()) {
      socket.emit("lobby-join-room-success", roomId);
      this.removeSocket(socket);
      room.addSocket(socket);
    }
  };

  private handleSocketLobbyCreateRoom = (socket: Socket) => {
    const roomId = this.generateUniqueRoomId();
    const room = new Room(roomId);
    this.rooms[roomId] = room;
    socket.emit("lobby-create-room-success", roomId);
    this.removeSocket(socket);
    room.addSocket(socket);
  };

  private removeSocket(socket: Socket) {
    const {
      onLobbyCreateRoomHandler,
      onLobbyJoinRoomHandler,
      onDisconnectHandler,
    } = this.socketCallbackBundles[socket.id];
    socket.off("lobby-create-room", onLobbyCreateRoomHandler);
    socket.off("lobby-join-room", onLobbyJoinRoomHandler);
    socket.off("disconnect", onDisconnectHandler);
    delete this.socketCallbackBundles[socket.id];
  }

  public removeRoom(roomId: string) {
    delete this.rooms[roomId];
  }

  private generateUniqueRoomId() {
    let roomId;
    do {
      roomId = Algorithm.randomString(Room.ID_LENGTH);
    } while (this.rooms[roomId] != null);
    return roomId;
  }
}

export default Lobby;
