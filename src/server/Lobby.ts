import Room from "./Room";
import { NUM_ROOMS } from "../common/Lobby";
import { Socket } from "socket.io";

class Lobby {
  private rooms: Room[];
  private sockets: Socket[];

  public static readonly shared = new Lobby();

  private constructor() {
    this.rooms = this.createRooms();
    this.sockets = [];
    this.broadcastRoomStatusEverySecond();
  }

  public addSocket(socket: Socket) {
    this.sockets.push(socket);
    socket.on("enter-room", (roomIndex: number) => {
      const room = this.rooms[roomIndex];
      if (room.isFull()) {
        console.log(`Room ${roomIndex} is already full`);
      } else {
        this.removeSocket(socket);
        room.addSocket(socket);
      }
    });
  }

  private removeSocket(socket: Socket) {
    this.sockets = this.sockets.filter((s) => s.id !== socket.id);
    socket.removeAllListeners("enter-room");
  }

  private createRooms() {
    const rooms = [];
    for (let i = 0; i < NUM_ROOMS; i++) {
      rooms.push(new Room(i));
    }
    return rooms;
  }

  private broadcastRoomStatusEverySecond() {
    const oneSecondInMilliseonds = 1000;
    setInterval(() => {
      const roomJsons = this.rooms.map((room) => room.toJson());
      this.sockets.forEach((socket) => {
        socket.emit("rooms-status", roomJsons);
      });
    }, oneSecondInMilliseonds);
  }
}

export default Lobby;
