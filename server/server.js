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

const port = process.env.PORT || 80;

let MarketManager = require("./MarketManager.js");
let User = require("./User.js");

const game_client_root = require("path").join(
  __dirname,
  "..",
  "client",
  "build"
);
app.use(express.static(game_client_root));

let marketManager = new MarketManager(io);

let serverCreatedAt = new Date();

app.get("/status", (req, res) => {
  res.send({
    status: "online",
    serverHours: (new Date() - serverCreatedAt) / (60 * 60 * 1000),
    ...marketManager.getStats(),
  });
});

app.post("/message", (req, res) => {
  if (req.body.secret === "44440570-52bf-4dfc-b81b-f7837528ee8d") {
    io.emit("alert", req.body.message);
    res.json({ message: "message sent" });
  } else {
    res.status(403);
    res.json({ message: "wrong secret" });
  }
});

app.post("/boost", (req, res) => {
  if (req.body.secret === "44440570-52bf-4dfc-b81b-f7837528ee8d") {
    marketManager.boost(req.body.symbol);
    res.json({ message: `boost applied to \$${req.body.symbol}` });
  } else {
    res.status(403);
    res.json({ message: "wrong secret" });
  }
});

io.on("connection", function (socket) {
  //let requestedRoom = socket.handshake.query.requestedRoom;
  let market = marketManager.getNextMarket();
  let user = new User(market, socket);
  market.addTrader(user);

  socket.join(market.id);

  socket.emit("transaction", {
    type: "starting-cash",
    newCash: user.cash.toFixed(2),
  });

  socket.emit("usernameSuggestion", {
    suggestion: user.suggestedName,
  });

  socket.emit(
    "assetDescriptions",
    market.assets.map((a) => ({
      symbol: a.symbol,
      name: a.name,
      color: a.color,
    }))
  );

  market.broadcastLeaderboard();

  console.log(`user ${user.name} has connected`);

  socket.on("buy-asset", (order) => {
    market.buy(order.symbol, user, order.shares, socket);
  });

  socket.on("close-out-asset", (order) => {
    market.closeOut(order.symbol, user, order.shares, socket);
  });

  socket.on("sell-asset", (order) => {
    market.sell(order.symbol, user, order.shares, socket);
  });

  socket.on("short-asset", (order) => {
    market.short(order.symbol, user, order.shares, socket);
  });

  socket.on("shill-asset", (symbol) => {
    market.shill(symbol, user);
  });

  socket.on("buy-upgrade", (upgradeType) => {
    user.upgrade(upgradeType, socket);
  });

  socket.on("buy-powerup", (powerup) => {
    user.buyPowerup(powerup, socket);
  });

  socket.on("set-username", (username) => {
    if (market.usernamesUsed.has(username) && username !== user.suggestedName) {
      socket.emit("usernameRejected", {});
    } else {
      user.name = username;
      console.log(`${user.name} set username to ${username}`);
      market.broadcastLeaderboard();
    }
  });

  socket.on("disconnect", () => {
    console.log(`${user.name} has disconnected`);
    market.removePlayer(user.id);
  });
});

http.listen(port, () => {
  console.log(new Date().toString() + " listening on port " + port + "...");
});
