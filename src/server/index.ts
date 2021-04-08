import express from "express";
import http from "http";
import SocketIO, { Socket } from "socket.io";
import Room from "./Room";

const app = express();
const server = http.createServer(app);
const io = new SocketIO.Server(server);
const port = process.env.PORT || 3000;

app.use(express.static("dist/client"));

const rooms = [new Room(), new Room()];

io.on("connection", (socket: Socket) => {
  console.log(`Established a connection with id ${socket.id}`);

  const roomsInterval = setInterval(() => {
    socket.emit(
      "rooms",
      rooms.map((room) => room.getNumConnections())
    );
  }, 1000);

  socket.on("enterroom", (roomNumber: number) => {
    const room = rooms[roomNumber];
    if (room.isFull()) {
      console.log(`Room ${roomNumber} is already full`);
    } else {
      room.addSocket(socket);
      socket.emit("enterroom-success", roomNumber);
    }
  });

  socket.on("leaveroom", (roomNumber: number) => {
    const room = rooms[roomNumber];
    room.removeSocket(socket);
  });

  socket.on("disconnect", () => {
    console.log(`Disconnected the connection with id ${socket.id}`);
    clearInterval(roomsInterval);
  });
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
