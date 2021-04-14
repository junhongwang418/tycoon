import Room from "./Room";
import { Socket } from "socket.io";
import Algorithm from "../common/Algorithm";

class Lobby {
  private rooms: { [id: string]: Room };
  private sockets: { [id: string]: Socket };

  public static readonly shared = new Lobby();

  private constructor() {
    this.rooms = {};
    this.sockets = {};
  }

  public addSocket(socket: Socket) {
    this.sockets[socket.id] = socket;

    socket.on("create-room", () => {
      const roomId = this.generateUniqueRoomId();
      const room = new Room(roomId);
      this.rooms[roomId] = room;
      socket.emit("create-room-success", roomId);
      this.removeSocket(socket);
      room.addSocket(socket);
    });

    socket.on("join-room", (roomId: string) => {
      const room = this.rooms[roomId];
      if (room && !room.isFull()) {
        socket.emit("join-room-success", roomId);
        this.removeSocket(socket);
        room.addSocket(socket);
      }
    });

    socket.on("disconnect", () => {
      this.removeSocket(socket);
    });
  }

  private removeSocket(socket: Socket) {
    socket.removeAllListeners("create-room");
    delete this.sockets[socket.id];
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
