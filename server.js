const express = require("express");
const app = express();
const http = 5500;
const io = require("socket.io")(http);
const path = require("path");

const users = {};

app.use(express.static(`${__dirname}/public`));

app.use("/", (req, res, next) => {
  res.sendFile(path.join(`index.html`));
  io.on("connection", (socket) => {
    socket.on("new-user", (name) => {
      users[socket.id] = name;
      socket.broadcast.emit("user-connected", name);
    });
    socket.on("send-chat-message", (message) => {
      socket.broadcast.emit("chat-message", {
        message: message,
        name: users[socket.id],
      });
    });
    socket.on("user-disconnected", () => {
      socket.broadcast.emit("user-disconnected", users[socket.id]);
      delete users[socket.id];
    });
  });
});

io.listen(5000);
