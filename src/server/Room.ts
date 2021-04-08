import { Socket } from "socket.io";
import Tycoon from "./Tycoon";

class Room {
  private socket1: Socket;
  private socket2: Socket;

  private isSocket1Ready: boolean;
  private isSocket2Ready: boolean;

  constructor() {
    this.isSocket1Ready = false;
    this.isSocket2Ready = false;
  }

  public addSocket(socket: Socket) {
    if (this.isFull()) return;

    if (this.socket1 == null) {
      this.socket1 = socket;
      socket.on("disconnect", this.handleSocket1Disconnect);
      socket.on("ready", this.handleSocket1Ready);
    } else if (this.socket2 == null) {
      this.socket2 = socket;
      socket.on("disconnect", this.handleSocket2Disconnect);
      socket.on("ready", this.handleSocket2Ready);
    }
  }

  private handleSocket1Disconnect = () => {
    this.socket1 = null;
    this.isSocket1Ready = false;

    if (this.socket2) {
      this.socket2.emit("forcequit");
      this.socket2 = null;
      this.isSocket2Ready = false;
    }
  };

  private handleSocket1Ready = () => {
    this.isSocket1Ready = true;
    if (this.isSocket2Ready) {
      this.play();
    }
  };

  private handleSocket2Disconnect = () => {
    this.socket2 = null;
    this.isSocket2Ready = false;

    if (this.socket1) {
      this.socket1.emit("forcequit");
      this.socket1 = null;
      this.isSocket1Ready = false;
    }
  };

  private handleSocket2Ready = () => {
    this.isSocket2Ready = true;
    if (this.isSocket1Ready) {
      this.play();
    }
  };

  public removeSocket(socket: Socket) {
    if (this.socket1 && socket.id === this.socket1.id) {
      this.socket1 = null;
      this.isSocket1Ready = false;
      socket.off("disconnect", this.handleSocket1Disconnect);
      socket.off("ready", this.handleSocket1Ready);
    } else if (this.socket2 && socket.id === this.socket2.id) {
      this.socket2 = null;
      this.isSocket2Ready = false;
      socket.off("disconnect", this.handleSocket2Disconnect);
      socket.off("ready", this.handleSocket2Ready);
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

  public getNumConnections() {
    if (this.socket1 && this.socket2) return 2;
    if (this.socket1 || this.socket2) return 1;
    return 0;
  }
}

export default Room;
