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

function buy(symbol, trader, socket) {
  let buyValue = Math.min(10, trader.cash);
  asset = getAssetBySymbol(symbol);

  let numShares =
    asset.poolShares -
    (asset.poolCash * asset.poolShares) / (asset.poolCash + buyValue);

  asset.poolShares -= numShares;
  asset.poolCash += buyValue;
  asset.price = asset.poolCash / asset.poolShares;

  trader.shares[symbol] += numShares;
  trader.cash -= buyValue;

  if (socket) {
    socket.emit("order-result", {
      status: "success",
      symbol: symbol,
      shares: numShares,
      cash: -buyValue,
    });
  }
}

function sell(symbol, trader, socket) {
  let numShares = Math.min(10, trader.shares[symbol]);

  asset = getAssetBySymbol(symbol);
  let sellValue =
    asset.poolCash -
    (asset.poolCash * asset.poolShares) / (asset.poolShares + numShares);

  asset.poolShares += numShares;
  asset.poolCash -= sellValue;
  asset.price = asset.poolCash / asset.poolShares;

  trader.shares[symbol] -= numShares;
  trader.cash += sellValue;

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

function shill(symbol, trader) {
  io.emit("hype-message", {
    message: generateShillMessage(symbol),
    username: trader.name,
  });
}

class User {
  constructor(name) {
    this.name = name;
    this.cash = 100;
    this.shares = {};
    for (let asset of assets) {
      this.shares[asset.symbol] = 0;
    }
  }
}

let users = [];

function getUser(username) {
  return users.filter((u) => u.username === username)[0];
}

io.on("connection", function (socket) {
  let user = new User(getUsername(socket));
  users.push(user);
  console.log(`user ${user.name} has connected`);
  socket.emit("assets", assets);

  socket.on("buy-asset", (symbol) => {
    console.log(`${user.name} requested to buy ${symbol}`);
    buy(symbol, user, socket);
  });

  socket.on("sell-asset", (symbol) => {
    console.log(`${user.name} requested to sell ${symbol}`);
    sell(symbol, user, socket);
  });

  socket.on("shill-asset", (symbol) => {
    console.log(`${user.name} requested to shill ${symbol}`);
    shill(symbol, user);
  });

  socket.on("buy-upgrade", (upgrade) => {
    console.log(`${user.name} requested upgrade ${upgrade}`);
  });

  socket.on("buy-powerup", (powerup) => {
    console.log(`${user.name} requested powerup ${upgrade}`);
  });
});

class Bot {
  constructor() {
    this.name = "bot";
    this.cash = 100;
    this.shares = {};
    for (let asset of assets) {
      this.shares[asset.symbol] = 0;
    }
  }
}

bot = new Bot();
function tickBots() {
  sell(_.sample(assets).symbol, bot);
  buy(_.sample(assets).symbol, bot);
  shill(_.sample(assets).symbol, bot);
}

function generateNews() {
  let asset = _.sample(assets);
  let name = _.sample([`\$${asset.symbol}`, asset.name]);

  let message = _.sample([
    `${asset.name} announces cloud-first quantum mainnet for Q${_.sample([
      1,
      2,
      3,
      4,
    ])}`,
    `8 killed and 35 wounded in \$${asset.symbol}-inspired massacre`,
    `Hackers from ${_.sample([5, 6, 7, 9])}chan exploit ${
      asset.name
    } zero day vulnerability`,
    `Analysts say \$${asset.symbol} trading 3 times above target`,
  ]);

  io.emit("news", message);
}
setInterval(tickBots, 2000);
setInterval(broadcastPrices, 1000);
setInterval(generateNews, 10000);

http.listen(port, () => {
  console.log("listening on port " + port + "...");
});
