const _ = require("lodash");
const utils = require("./utils.js");
const narrativeUtils = require("./narrativeUtils.js");
const constants = require("./constants");
const SECOND = 1000;
const Bot = require("./Bot.js");

const LEADERBOARD_SIZE = 10;
const BOT_QUITTING_THRESHOLD = 50;
const DESIRED_BOT_COUNT = 15;
const MAX_FUNDAMENTAL_PRICE = 2000;
const MIN_FUNDAMENTAL_PRICE = 0.05;

class Market {
  constructor(io) {
    this.io = io;
    this.generateInitialAssets();
    this.traders = [];

    for (let i = 0; i < DESIRED_BOT_COUNT; i++) {
      this.addTrader(new Bot(this));
    }

    setInterval(() => this.broadcastPrices(), 1 * SECOND);
    setInterval(() => this.generateNews(), 15 * SECOND);
    setInterval(() => this.updateMarketMetrics(), 1 * SECOND);
    setInterval(() => this.broadcastLeaderboard(), 5 * SECOND);
    setInterval(() => this.tickBots(), 2 * SECOND);
    setInterval(() => this.cullBots(), 10 * SECOND);
  }

  tickBots() {
    this.getBots().forEach((b) => b.tick());
  }

  addTrader(trader) {
    this.traders.push(trader);
    trader.startingNetWorth = this.getNetWorth(trader);
  }

  getBots() {
    return this.traders.filter((t) => t.type === constants.TRADER_TYPE_BOT);
  }

  getPlayers() {
    return this.traders.filter((t) => t.type === constants.TRADER_TYPE_PLAYER);
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
        name: "Blueberrry Technologies",
        symbol: "BB",
        color: "#1f77b4",
        poolShares: 100,
        poolCash: 100,
        hype: 0,
        velocity: 0,
      },
      {
        name: "Mooncoin",
        symbol: "MNC",
        color: "#2ca02c",
        poolShares: 100,
        poolCash: 100,
        hype: 0,
        velocity: 0,
      },
      {
        name: "Brook Video Rental",
        symbol: "BVR",
        color: "#d62728",
        poolShares: 100,
        poolCash: 100,
        hype: 0,
        velocity: 0,
      },
      {
        name: "Sundog Growers",
        symbol: "SDG",
        color: "#ff7f0e",
        poolShares: 100,
        poolCash: 100,
        hype: 0,
        velocity: 0,
      },
    ];

    this.assets.forEach((asset) => {
      asset.price = asset.poolCash / asset.poolShares;
      asset.previousPrice = asset.price;
      asset.fundamentalPrice = asset.price;
    });
  }

  getAssetBySymbol(symbol) {
    return this.assets.filter((a) => a.symbol === symbol)[0];
  }

  updateMarketMetrics() {
    this.assets.forEach((asset) => {
      asset.velocity =
        (asset.price - asset.previousPrice) / asset.previousPrice;
      asset.previousPrice = 0.5 * asset.previousPrice + 0.5 * asset.price;
      asset.hype = asset.hype * 0.95;
    });
  }

  buy(symbol, trader, numShares, socket) {
    let asset = this.getAssetBySymbol(symbol);

    let numSharesTraderCanAfford =
      asset.poolShares -
      (asset.poolCash * asset.poolShares) / (asset.poolCash + trader.cash);

    if (numSharesTraderCanAfford < numShares) {
      numShares = Math.floor(numSharesTraderCanAfford);
    }

    let buyValue =
      (asset.poolCash * asset.poolShares) / (asset.poolShares - numShares) -
      asset.poolCash;

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
        price: (buyValue / numShares).toFixed(2),
        newCash: trader.cash.toFixed(2),
        newShares: trader.shares[symbol],
      });
    }
  }

  sell(symbol, trader, numShares, socket) {
    numShares = Math.min(numShares, trader.shares[symbol]);

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
        price: (sellValue / numShares).toFixed(2),
        newCash: trader.cash.toFixed(2),
        newShares: trader.shares[symbol],
      });
    }
  }

  generateShillMessage(symbol) {
    return _.sample([
      `short interest on \$${symbol} is STILL GOING UP`,
      `HOLD \$${symbol}${"!".repeat(
        _.sample([1, 2, 3, 4])
      )} APES TOGETHER STRONG ${"🐵".repeat(_.sample([1, 2, 3]))}`,
      `BUY BUY \$${symbol} to ${narrativeUtils.generateAstronomicalBody()} ${"🚀".repeat(
        _.sample([3, 4, 5, 8])
      )}`,
      `🤑 Just sold my ${_.sample([
        "",
        "sister's ",
        "girlfriend's ",
        "boyfriend's ",
      ])}${_.sample([
        "house",
        "car",
        "kidney",
        "star wars miniatures",
        narrativeUtils.generateCcgCard()
      ])}- gotta buy more \$${symbol} 🤑`,
      `I'm so HORNY for \$${symbol} 😍🥵🥵💦`,
      `APES STRONGER TOGETHER - BUY \$${symbol} ${"🍌".repeat(
        _.sample([1, 2, 3])
      )}${"🐵".repeat(_.sample([1, 2, 3]))}`,
      `buy \$${symbol} THIS IS THE WAY `,
      `The squeeze has not squoze. If you sell \$${symbol} now you will regret it.`,
      `🙌💎 \$${symbol} 💎🙌`,
    ]);
  }

  shill(symbol, trader) {
    let asset = this.getAssetBySymbol(symbol);
    asset.hype = 1 - (1 - asset.hype) * 0.95;
    this.io.emit("hype-message", {
      text: this.generateShillMessage(symbol),
      name: trader.name,
      symbol: symbol
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

  getExuberance(asset) {
    return Math.max(asset.price / asset.fundamentalPrice - 1, 0) + 0.01;
  }

  generateNews() {
    let message;
    let asset = utils.sampleWeighted(this.assets, (asset) =>
      this.getExuberance(asset)
    );
    if (this.getExuberance(asset) > 1 && Math.random() < 0.4) {
      message = _.sample([
        `Analysts say \$${asset.symbol} trading ${Math.round(
          asset.price / asset.fundamentalPrice
        )} times above target`,
        `${_.sample([
          "Fed chairman warns",
          "Fintech CEO warns",
          "Hedge fund manager warns",
          "Regulators warn",
        ])} of ${_.sample([
          '"irrational exuberance"',
          '"unusual" market volatility',
          '"imminent" collapse',
        ])} in \$${asset.symbol} price`,
      ]);
    } else {
      asset = _.sample(this.assets);
      let significance = Math.random();
      if (Math.random() < 0.55) {
        message = _.sample([
          `${asset.name} (\$${asset.symbol}) announces ${narrativeUtils.generateTechnologyProduct()} for Q${_.sample([1, 2, 3, 4])}`,
          `${asset.name} (\$${asset.symbol}) receives approval to open ${Math.round(
            significance * 20 + 2
          )} new dispensaries`,
          `Clinical trials show ${asset.name} (\$${asset.symbol}) ${_.sample([
            "synthetic cannabinoids",
            "psilocybin mushroom extracts",
          ])} hold promise for treating Groat's syndrome`,
        ]);
        asset.fundamentalPrice = Math.min(MAX_FUNDAMENTAL_PRICE, asset.fundamentalPrice * (1 + significance));
        setTimeout(() => asset.hype = 1 - (1 - asset.hype) * 0.75, Math.random() * 3 * SECOND);
      } else {
        message = _.sample([
          `${Math.round(significance * 40 + 1)} injured in \$${
            asset.symbol
          }-related incident`,
          `${narrativeUtils.generateHackerOrg()} hackers exploit ${asset.name} (\$${asset.symbol}) zero-day vulnerability`,
          `${asset.name} (\$${asset.symbol}) announcements draw ${_.sample([
            "SEC",
            "FDA",
            "CFPB",
            "CFTC",
            "anti-trust",
            "congressional",
          ])} scrutiny`,
          `${asset.name} (\$${asset.symbol}) CEO arrested on ${_.sample([
            "embezzlement",
            "drug",
            "DUI",
            "insider trading",
            "conspiracy",
          ])} charges`,
        ]);
        asset.fundamentalPrice = Math.max(MIN_FUNDAMENTAL_PRICE, asset.fundamentalPrice / (1 + significance));
      }
    }
    this.io.emit("news", { text: message });
  }

  getNetWorth(trader) {
    let netWorth = trader.cash;
    this.assets.forEach((asset) => {
      netWorth += trader.shares[asset.symbol] * asset.price;
    });
    return netWorth;
  }

  cullBots() {
    let quittingTraders = _.remove(this.traders, (t) => t.type === constants.TRADER_TYPE_BOT && this.getNetWorth(t) < BOT_QUITTING_THRESHOLD);
    quittingTraders.forEach(trader => {
      trader.sellEverything();
      console.log(`bot ${trader.name} is quitting`);
    });

    if (this.getBots().length < DESIRED_BOT_COUNT) {
      this.addTrader(new Bot(this));
      console.log(`a new bot joins`);
    }
  }

  broadcastLeaderboard() {
    let leaderboard = this.traders.map((trader) => ({
      name: trader.name,
      id: trader.id,
      netWorth: this.getNetWorth(trader).toFixed(2),
      cash: trader.cash.toFixed(2),
      profit: (this.getNetWorth(trader) - trader.startingNetWorth + trader.totalSpentOnUpgrades).toFixed(2),
    })).sort((a, b) => b.profit - a.profit);
    let rankLookup = {};
    for (let i = 0; i < leaderboard.length; i++) {
      rankLookup[leaderboard[i].id] = i;
    }
    let top = leaderboard.slice(0, Math.min(LEADERBOARD_SIZE, leaderboard.length));
    this.getPlayers().forEach((trader) => {
      trader.socket.emit("leaderboard", { rank: rankLookup[trader.id], total: leaderboard.length, top });
    });
    if (Math.random() < 0.02) {
      this.io.emit("news", { text: `FOMO LOCO trader ${top[0].name} called to testify before House Committee on Financial Services` });
    }
  }
}

module.exports = Market;
