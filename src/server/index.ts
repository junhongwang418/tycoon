import express from "express";
import http from "http";
import SocketIO, { Socket } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new SocketIO.Server(server);
const port = process.env.PORT || 3000;

app.use(express.static("dist/client"));

io.on("connection", (socket: Socket) => {
  console.log(`Established a connection with id ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Disconnected the connection with id ${socket.id}`);
  });
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
