const _ = require("lodash");

const LEADERBOARD_SIZE = 10;
const TRADER_TYPE_BOT = 0;

class Market {
  constructor(io) {
    this.io = io;
    this.generateInitialAssets();
    this.traders = [];

    setInterval(() => this.broadcastPrices(), 1000);
    setInterval(() => this.generateNews(), 10000);
    setInterval(() => this.updateMarketMetrics(), 1000);
    setInterval(() => this.broadcastLeaderboard(), 5000);
  }

  addTrader(trader) {
    this.traders.push(trader);
    trader.startingNetWorth = this.getNetWorth(trader);
  }

  getBots() {
    return this.traders.filter((t) => t.type === TRADER_TYPE_BOT);
  }

  getTraderByName(name) {
    let matches = this.traders.filter((t) => t.name === name);
    if (matches.length) {
      return matches[0];
    } else return null;
  }

  generateInitialAssets() {
    this.assets = [
      {
        name: "Agricorp Conglomerated Holdings",
        symbol: "ACH",
        poolShares: 100,
        poolCash: 100,
        hype: 0,
        velocity: 0,
      },
      {
        name: "Mooncoin",
        symbol: "MNC",
        poolShares: 100,
        poolCash: 100,
        hype: 0,
      },
      {
        name: "Brook Video Rental",
        symbol: "BVR",
        poolShares: 100,
        poolCash: 100,
        hype: 0,
        velocity: 0,
      },
    ];

    this.assets.forEach((asset) => {
      asset.price = asset.poolCash / asset.poolShares;
      asset.previousPrice = asset.price;
    });
  }

  getAssetBySymbol(symbol) {
    return this.assets.filter((a) => a.symbol === symbol)[0];
  }

  updateMarketMetrics() {
    this.assets.forEach((asset) => {
      asset.velocity =
        (asset.price - asset.previousPrice) / asset.previousPrice;
      asset.hype = asset.hype * 0.95;
    });
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
        price: buyValue,
        newCash: trader.cash,
        newShares: trader.shares[symbol],
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
        price: sellValue,
        newCash: trader.cash,
        newShares: trader.shares[symbol],
      });
    }
  }

  generateAstronomicalBody() {
    let expletive = Math.random() <= 0.3;
    let definiteArticle = Math.random() <= 0.7;
    let name = definiteArticle ? _.sample([
      `MOON`,
      `MOOON`,
      `MOOOON`,
      `MOOOOOOOON`,
      'SUN',
      'SUN',
      'ANDROMEDA GALAXY',
      'VOYAGER PROBE'
    ]) : _.sample([
      `MARS`,
      `JUPITER`,
      `SATURN`,
      `URANUS`,
      `NEPTUNE`,
      `PLUTO`
    ]);
    let text = '';
    if (definiteArticle) text += 'the ';
    if (expletive) text += _.sample(['fuckin', 'fucking', 'freakin', 'freaking']) + ' ';
    text += name;
    return text;
  }

  generateShillMessage(symbol) {
    return _.sample([
      `short interest on \$${symbol} is STILL GOING UP`,
      `HOLD \$${symbol}${"!".repeat(
        _.sample([1, 2, 3, 4])
      )} APES TOGETHER STRONG ${"🐵".repeat(_.sample([1, 3]))}`,
      `BUY BUY \$${symbol} to ${this.generateAstronomicalBody()} ${"🚀".repeat(_.sample([3, 4, 5, 8]))}`,
      `🤑 Just sold my ${_.sample([
        "house",
        "car",
        "star wars miniatures",
      ])}- gotta buy more \$${symbol} 🤑`,
      `I'm so HORNY for \$${symbol} 😍🥵🥵💦`,
      `APES STRONGER TOGETHER - BUY \$${symbol} 🍌🍌🍌🐵🐵🐵`,
      `buy \$${symbol} THIS IS THE WAY `,
      `The squeeze has not squoze. If you sell \$${symbol} now you will regret it.`,
      `🙌💎 \$${symbol} 💎🙌`
    ]);
  }

  shill(symbol, trader) {
    let asset = this.getAssetBySymbol(symbol);
    asset.hype = 1 - (1 - asset.hype) * 0.95;
    this.io.emit("hype-message", {
      text: this.generateShillMessage(symbol),
      name: trader.name,
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
      data.push({ symbol: asset.symbol, price: asset.price.toFixed(2) });
    }
    this.io.emit("prices", data);
  }

  generateNews() {
    let asset = _.sample(this.assets);

    let message = _.sample([
      `${asset.name} announces ${_.sample([
        "cloud-first",
        "multi-cloud",
        "decentralized",
        "hybrid",
      ])} ${_.sample(["quantum ", ""])}${_.sample([
        "mainnet",
        "augmented-reality platform",
        "AI platform",
      ])} for Q${_.sample([1, 2, 3, 4])}`,
      `${Math.round(Math.random() * 40 + 1)} wounded in \$${
        asset.symbol
      }-related incident`,
      `Hackers from ${_.sample([5, 6, 7, 9])}chan exploit ${
        asset.name
      } zero-day vulnerability`,
      `Analysts say \$${asset.symbol} trading 3 times above target`,
    ]);

    this.io.emit("news", { text: message });
  }

  getNetWorth(trader) {
    let netWorth = trader.cash;
    this.assets.forEach((asset) => {
      netWorth += trader.shares[asset.symbol] * asset.price;
    });
    return netWorth;
  }

  broadcastLeaderboard() {
    let leaderboard = [];
    this.traders.forEach((trader) => {
      leaderboard.push({
        name: trader.name,
        netWorth: this.getNetWorth(trader).toFixed(2),
        cash: trader.cash.toFixed(2),
        profit: (this.getNetWorth(trader) - trader.startingNetWorth).toFixed(2),
      });
    });
    leaderboard = leaderboard
      .sort((a, b) => b.netWorth - a.netWorth)
      .slice(0, Math.min(LEADERBOARD_SIZE, leaderboard.length));
    this.io.emit("leaderboard", leaderboard);
  }
}

module.exports = Market;
