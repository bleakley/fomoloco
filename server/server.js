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
let Bot = require("./Bot.js");
const NUM_BOTS = 3;

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
    cash: user.cash,
  });

  console.log(`user ${user.name} has connected`);

  socket.on("buy-asset", (symbol) => {
    console.log(`${user.name} requested to buy ${symbol}`);
    market.buy(symbol, user, socket);
  });

  socket.on("sell-asset", (symbol) => {
    console.log(`${user.name} requested to sell ${symbol}`);
    market.sell(symbol, user, socket);
  });

  socket.on("shill-asset", (symbol) => {
    console.log(`${user.name} requested to shill ${symbol}`);
    market.shill(symbol, user);
  });

  socket.on("buy-upgrade", (upgrade) => {
    console.log(`${user.name} requested upgrade ${upgrade}`);
  });

  socket.on("buy-powerup", (powerup) => {
    console.log(`${user.name} requested powerup ${upgrade}`);
  });
});

for (let i = 0; i < NUM_BOTS; i++) {
  market.addTrader(new Bot(market));
}

function tickBots() {
  market.getBots().forEach((b) => b.tick());
}

setInterval(tickBots, 2000);

http.listen(port, () => {
  console.log("listening on port " + port + "...");
});
