const _ = require("lodash");

class Market {
  constructor(io) {
    this.io = io;
    this.generateInitialAssets();

    setInterval(() => this.broadcastPrices(), 1000);
    setInterval(() => this.generateNews(), 10000);
  }

  generateInitialAssets() {
    this.assets = [
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

  getAssetBySymbol(symbol) {
    return this.assets.filter((a) => a.symbol === symbol)[0];
  }

  buy(symbol, trader, socket) {
    let buyValue = Math.min(10, trader.cash);
    let asset = this.getAssetBySymbol(symbol);

    let numShares =
      asset.poolShares -
      (asset.poolCash * asset.poolShares) / (asset.poolCash + buyValue);

    asset.poolShares -= numShares;
    asset.poolCash += buyValue;
    asset.price = asset.poolCash / asset.poolShares;

    trader.shares[symbol] += numShares;
    trader.cash -= buyValue;

    if (socket) {
      socket.emit("transaction", {
        type: "buy",
        symbol: symbol,
        shares: numShares,
        cash: buyValue,
      });
    }
  }

  sell(symbol, trader, socket) {
    let numShares = Math.min(10, trader.shares[symbol]);

    let asset = this.getAssetBySymbol(symbol);
    let sellValue =
      asset.poolCash -
      (asset.poolCash * asset.poolShares) / (asset.poolShares + numShares);

    asset.poolShares += numShares;
    asset.poolCash -= sellValue;
    asset.price = asset.poolCash / asset.poolShares;

    trader.shares[symbol] -= numShares;
    trader.cash += sellValue;

    if (socket) {
      socket.emit("transaction", {
        type: "sell",
        symbol: symbol,
        shares: numShares,
        cash: sellValue,
      });
    }
  }

  generateShillMessage(symbol) {
    return _.sample([
      `short interest on \$${symbol} is STILL GOING UP`,
      `HOLD \$${symbol}!!! APES TOGETHER STRONG`,
      `BUY BUY \$${symbol} to the fucking M${"O".repeat(
        _.sample([3, 4, 5, 8])
      )}N ${"🚀".repeat(_.sample([3, 4, 5, 8]))}`,
      `🤑 Just sold my house- gotta buy more \$${symbol} 🤑`,
      `I'm so HORNY for \$${symbol} 😍🥵🥵💦`,
      `APES STRONGER TOGETHER - BUY \$${symbol} 🍌🍌🍌🐵🐵🐵`,
    ]);
  }

  shill(symbol, trader) {
    this.io.emit("hype-message", {
      message: this.generateShillMessage(symbol),
      username: trader.name,
    });
  }

  broadcastPrices() {
    let data = [];
    for (let asset of this.assets) {
      // console.log(
      //   `${asset.symbol} ${asset.price} ${asset.poolCash} ${asset.poolShares} ${
      //     asset.poolShares * asset.poolCash
      //   }`
      // );
      data.push({ symbol: asset.symbol, price: asset.price });
    }
    this.io.emit("prices", data);
  }

  generateNews() {
    let asset = _.sample(this.assets);

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

    this.io.emit("news", message);
  }
}

module.exports = Market;
