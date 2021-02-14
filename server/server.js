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

function broadcastPrices() {
  data = [];
  for (asset of assets) {
    data.push({ symbol: asset.symbol, price: asset.price });
  }
  io.emit("prices", data);
}

function buy(symbol, username, socket) {
  asset = getAssetBySymbol(symbol);
  asset.price = asset.price * 0.9;
  if (socket) {
    socket.emit("order-result", {
      status: "success",
      symbol: symbol,
      shares: 10,
      money: -10 * asset.price,
    });
  }
}

function sell(symbol, username, socket) {
  asset = getAssetBySymbol(symbol);
  asset.price = asset.price * 1.1;
  if (socket) {
    socket.emit("order-result", {
      status: "success",
      symbol: symbol,
      shares: -10,
      money: 10 * asset.price,
    });
  }
}

function generateShillMessage(symbol) {
  return `${symbol} is going to the moon!`;
}

function shill(symbol, username) {
  io.emit("hype-message", {
    message: generateShillMessage(symbol),
    username: username,
  });
}

io.on("connection", function (socket) {
  let username = getUsername(socket);
  console.log(`user ${username} has connected`);
  socket.emit("assets", assets);

  socket.on("buy-asset", (symbol) => {
    console.log(`${username} requested to buy ${symbol}`);
    buy(symbol, username, socket);
  });

  socket.on("sell-asset", (symbol) => {
    console.log(`${username} requested to sell ${symbol}`);
    sell(symbol, username, socket);
  });

  socket.on("shill-asset", (symbol) => {
    console.log(`${username} requested to shill ${symbol}`);
    shill(symbol, username);
  });

  socket.on("buy-upgrade", (upgrade) => {
    console.log(`${username} requested upgrade ${upgrade}`);
  });

  socket.on("buy-powerup", (powerup) => {
    console.log(`${username} requested powerup ${upgrade}`);
  });
});

function tickBots() {
  sell(_.sample(assets).symbol, "bot");
  buy(_.sample(assets).symbol, "bot");
  shill(_.sample(assets).symbol, "bot");
}

setInterval(tickBots, 2000);
setInterval(broadcastPrices, 2000);

http.listen(port, () => {
  console.log("listening on port " + port + "...");
});
