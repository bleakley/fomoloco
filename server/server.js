const { strict } = require("assert");
const cors = require("cors");
const express = require("express");
const app = express();
app.use(cors());
app.use(express.json());

const _ = require("lodash");

const http = require("http").createServer(app);

const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const port = 8080;

let Market = require("./Market.js");
let User = require("./User.js");

app.get("/status", (req, res) => {
  res.send({ status: "online" });
});

let market = new Market(io);

const getUsername = (socket) => {
  return socket.handshake.query.username;
};

io.on("connection", function (socket) {
  let username = getUsername(socket);
  let user = market.getTraderByName(username);
  if (!user) {
    user = new User(username, market);
    market.addTrader(user);
  }

  socket.emit("transaction", {
    type: "starting-cash",
    newCash: user.cash.toFixed(2),
  });

  console.log(`user ${user.name} has connected`);

  socket.on("buy-asset", (order) => {
    console.log(
      `${user.name} requested to buy ${order.shares} ${order.symbol}`
    );
    market.buy(order.symbol, user, order.shares, socket);
  });

  socket.on("sell-asset", (order) => {
    console.log(
      `${user.name} requested to sell ${order.shares} ${order.symbol}`
    );
    market.sell(order.symbol, user, order.shares, socket);
  });

  socket.on("shill-asset", (symbol) => {
    console.log(`${user.name} requested to shill ${symbol}`);
    market.shill(symbol, user);
  });

  socket.on("buy-upgrade", (upgradeType) => {
    console.log(`${user.name} requested upgrade ${upgradeType}`);
    user.upgrade(upgradeType, socket);
  });

  socket.on("buy-powerup", (powerup) => {
    console.log(`${user.name} requested powerup ${upgrade}`);
  });
});

http.listen(port, () => {
  console.log("listening on port " + port + "...");
});
