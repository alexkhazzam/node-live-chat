const Express = require("express");
const app = Express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const users = {};

app.use(Express.static(`${__dirname}/public`));

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

http.listen(5000);
