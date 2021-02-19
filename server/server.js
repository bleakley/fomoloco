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

const game_client_root = require('path').join(__dirname, '..', 'client', 'build');
app.use(express.static(game_client_root));

let market = new Market(io);

let serverCreatedAt = new Date();

app.get("/status", (req, res) => {
  res.send({
    status: "online",
    players: market.getPlayers().length,
    playersQuit: market.playersQuitCount,
    bots: market.getBots().length,
    botsCulled: market.botsCulledCount,
    hours: ((new Date() - serverCreatedAt) / (60 * 60 * 1000)).toFixed(2)
  });
});

app.post("/message", (req, res) => {
  if (req.body.secret === '44440570-52bf-4dfc-b81b-f7837528ee8d') {
    io.emit("alert", req.body.message)
    res.json({ message: 'message sent' })
  } else {
    res.status(403);
    res.json({ message: 'wrong secret' })
  }
});

io.on("connection", function (socket) {

  let user = new User(market, socket);
  market.addTrader(user);

  socket.emit("transaction", {
    type: "starting-cash",
    newCash: user.cash.toFixed(2),
  });

  socket.emit("assetDescriptions", market.assets.map(a => ({symbol: a.symbol, name: a.name, color: a.color})));

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

  socket.on("set-username", (username) => {
    user.name = username;
    console.log(`${user.name} set username to ${username}`);
  });

  socket.on("disconnect", () => {
    console.log(`${user.name} has disconnected`);
    market.removePlayer(user.id);
  });
});

http.listen(port, () => {
  console.log("listening on port " + port + "...");
});
