const cors = require("cors");
const express = require("express");
const app = express();
app.use(cors());
app.use(express.json());

const _ = require("lodash");

const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  handlePreflightRequest: (req, res) => {
    const headers = {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin": "http://fomolo.co", //req.headers.origin, //or the specific origin you want to give access to,
      "Access-Control-Allow-Credentials": true,
    };
    res.writeHead(200, headers);
    res.end();
  },
});

const port = 8080;

app.get("/status", (req, res) => {
  res.send({ status: "online" });
});

function generateInitialAssets() {
  return [
    { name: "Agricorp Conglomerated Holdings", symbol: "ACH", price: 10 },
    { name: "Mooncoin", symbol: "MNC", price: 0.2 },
    { name: "Brook Video Rental", symbol: "BVR", price: 60 },
  ];
}

let assets = generateInitialAssets();

const getUsername = (socket) => {
  return socket.handshake.query.username;
};

function getAssetBySymbol(symbol) {
  return assets.filter((a) => a.symbol === symbol)[0];
}

function broadcastPrice(asset) {
  io.emit("price", { symbol: asset.symbol, price: asset.price });
}

function buy(order, username) {
  asset = getAssetBySymbol(order.symbol);
  asset.price = asset.price * 0.9;
  broadcastPrice(asset);
}

function sell(order, username) {
  asset = getAssetBySymbol(order.symbol);
  asset.price = asset.price * 1.1;
  broadcastPrice(asset);
}

function generateShillMessage(symbol) {
  return `${symbol} is going to the moon!`;
}

function shill(shillRequest, username) {
  io.emit("shill", {
    message: generateShillMessage(shillRequest.symbol),
    username: username,
  });
}

io.on("connection", function (socket) {
  let username = getUsername(socket);
  console.log(`user ${username} has connected`);
  socket.emit("assets", assets);

  socket.on("buy-asset", (order) => {
    console.log(`${username} requested to buy ${order.shares} ${order.symbol}`);
    buy(order, username);
  });

  socket.on("sell-asset", (order) => {
    console.log(
      `${username} requested to sell ${order.shares} ${order.symbol}`
    );
    sell(order, username);
  });

  socket.on("shill-asset", (shillRequest) => {
    console.log(`${username} requested to shill ${shillRequest.symbol}`);
    shill(shillRequest, username);
  });

  socket.on("buy-upgrade", (upgrade) => {
    console.log(`${username} requested to shill ${upgrade.name}`);
  });
});

function tickBots() {
  sell({ symbol: _.sample(assets).symbol, shares: 10 }, "bot");
  buy({ symbol: _.sample(assets).symbol, shares: 10 }, "bot");
  shill({ symbol: _.sample(assets).symbol }, "bot");
}

setInterval(tickBots, 2000);

http.listen(port, () => {
  console.log("listening on port " + port + "...");
});
