import express, { Express } from "express";
import http, { Server } from "http";
import SocketIO, { Socket } from "socket.io";
import Lobby from "./Lobby";

class Application {
  private app: Express;
  private server: Server;
  private io: SocketIO.Server;
  private port: string | number;

  public static readonly shared = new Application();

  private constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new SocketIO.Server(this.server);
    this.port = process.env.PORT || 3000;
  }

  public start() {
    this.app.use(express.static("dist/client"));
    this.io.on("connection", this.handleSocketConnection);
    this.server.listen(this.port, () => {
      console.log(`Listening on port ${this.port}`);
    });
  }

  private handleSocketConnection = (socket: Socket) => {
    Lobby.shared.addSocket(socket);
  };
}

export default Application;
