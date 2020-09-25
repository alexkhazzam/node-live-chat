const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const Express = require("express");
const fs = require("fs");
const app = Express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const users = {};

app.use(Express.static(`${__dirname}/public`));

const fetchMovies = (file, name) => {
  const promise = new Promise((resolve, reject) => {
    fs.readFile(file, "utf-8", (err, data) => {
      if (err) {
        reject("Could not find file!");
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
  return promise;
};

let userName;

io.on("connection", (socket) => {
  socket.on("new-user", (name) => {
    userName = name;
    users[socket.id] = name;
    socket.broadcast.emit("user-connected", name);
  });
  socket.on("send-chat-message", (message) => {
    socket.broadcast.emit("chat-message", {
      message: message,
      name: users[socket.id],
    });
    fetchMovies(`${__dirname}/data/data.json`, userName)
      .then((data) => {
        const newName = {
          name: userName,
          time: new Date(),
          message: message,
        };
        data.push(newName);
        console.log(data);
        const JSONArr = [...data];
        fs.writeFileSync(
          `${__dirname}/data/data.json`,
          JSON.stringify(JSONArr)
        );
      })
      .catch((err) => {
        throw err;
      });
  });
  socket.on("user-disconnected", () => {
    socket.broadcast.emit("user-disconnected", users[socket.id]);
    delete users[socket.id];
  });
});

const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
