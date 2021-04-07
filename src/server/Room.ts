import { Socket } from "socket.io";
import Tycoon from "./Tycoon";

class Room {
  private socket1: Socket;
  private socket2: Socket;

  public addSocket(socket: Socket) {
    if (this.isFull()) return;

    if (this.socket1 == null) {
      this.socket1 = socket;
      socket.on("disconnect", () => (this.socket1 = null));
    } else if (this.socket2 == null) {
      this.socket2 = socket;
      socket.on("disconnect", () => (this.socket2 = null));
    }
  }

  public isFull() {
    return this.socket1 && this.socket2;
  }

  public play() {
    if (!this.isFull()) return;
    const tycoon = new Tycoon(this.socket1, this.socket2);
    tycoon.start();
  }
}

export default Room;
