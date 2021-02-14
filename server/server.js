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
    {
      name: "Agricorp Conglomerated Holdings",
      symbol: "ACH",
      price: 10,
      poolShares: 100,
      poolCash: 100,
    },
    {
      name: "Mooncoin",
      symbol: "MNC",
      price: 0.2,
      poolShares: 100,
      poolCash: 100,
    },
    {
      name: "Brook Video Rental",
      symbol: "BVR",
      price: 60,
      poolShares: 100,
      poolCash: 100,
    },
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
    // console.log(
    //   `${asset.symbol} ${asset.price} ${asset.poolCash} ${asset.poolShares} ${
    //     asset.poolShares * asset.poolCash
    //   }`
    // );
    data.push({ symbol: asset.symbol, price: asset.price });
  }
  io.emit("prices", data);
}

function buy(symbol, username, socket) {
  asset = getAssetBySymbol(symbol);
  let buyValue = 10;
  let numShares =
    asset.poolShares -
    (asset.poolCash * asset.poolShares) / (asset.poolCash + buyValue);

  asset.poolShares -= numShares;
  asset.poolCash += buyValue;
  asset.price = asset.poolCash / asset.poolShares;

  if (socket) {
    socket.emit("order-result", {
      status: "success",
      symbol: symbol,
      shares: numShares,
      cash: -buyValue,
    });
  }
}

function sell(symbol, username, socket) {
  asset = getAssetBySymbol(symbol);
  let numShares = 10;
  let sellValue =
    asset.poolCash -
    (asset.poolCash * asset.poolShares) / (asset.poolShares + numShares);

  asset.poolShares += numShares;
  asset.poolCash -= sellValue;
  asset.price = asset.poolCash / asset.poolShares;
  if (socket) {
    socket.emit("order-result", {
      status: "success",
      symbol: symbol,
      shares: -numShares,
      cash: sellValue,
    });
  }
}

function generateShillMessage(symbol) {
  let asset = getAssetBySymbol(symbol);
  let name = _.sample([symbol, asset.name.split(" ")[0]]);
  return _.sample([
    `${name} is going to the moon!`,
    `I took out a mortage to put \$150K into ${name.toLowerCase()}`,
    `short interest on ${name} is STILL GOING UP`,
    `HOLD ${name.toUpperCase()}!!! APES TOGETHER STRONG`,
  ]);
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
setInterval(broadcastPrices, 1000);

http.listen(port, () => {
  console.log("listening on port " + port + "...");
});
