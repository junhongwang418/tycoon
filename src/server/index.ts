import express from "express";
import http from "http";
import SocketIO, { Socket } from "socket.io";
import Room from "./Room";

const app = express();
const server = http.createServer(app);
const io = new SocketIO.Server(server);
const port = process.env.PORT || 3000;

app.use(express.static("dist/client"));

const room = new Room();

io.on("connection", (socket: Socket) => {
  console.log(`Established a connection with id ${socket.id}`);

  if (room.isFull()) {
    console.log("The room is already full. Please try again later.");
  } else {
    room.addSocket(socket);
    if (room.isFull()) {
      console.log("A new game has started!");
      room.play();
    }
  }

  socket.on("disconnect", () => {
    console.log(`Disconnected the connection with id ${socket.id}`);
  });
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
