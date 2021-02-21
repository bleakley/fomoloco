const _ = require("lodash");
const utils = require("./utils.js");
const narrativeUtils = require("./narrativeUtils.js");
const constants = require("./constants");
const SECOND = 1000;
const Bot = require("./Bot.js");
const uuid = require("uuid");
const { remove } = require("lodash");

const LEADERBOARD_SIZE = 10;
const BOT_QUITTING_THRESHOLD = 50;
const DESIRED_BOT_COUNT = 15;
const MAX_FUNDAMENTAL_PRICE = 200;
const MIN_FUNDAMENTAL_PRICE = 0.05;
const SECONDS_BETWEEN_DIVIDENDS = 60;

class Market {
  constructor(io) {
    this.io = io;
    this.id = uuid.v4();
    this.createdAt = new Date();
    this.generateInitialAssets();
    this.traders = [];
    this.botsCulledCount = 0;
    this.playersQuitCount = 0;
    this.maxMargin = 1.5;

    this.usernamesUsed = new Set();

    for (let i = 0; i < DESIRED_BOT_COUNT; i++) {
      this.addTrader(new Bot(this, this.getUniqueUserName()));
    }

    setInterval(() => this.broadcastPrices(), 1 * SECOND);
    setInterval(() => this.generateNews(), 15 * SECOND);
    setInterval(() => this.updateMarketMetrics(), 1 * SECOND);
    setInterval(() => this.broadcastLeaderboard(), 5 * SECOND);
    setInterval(() => this.tickBots(), 2 * SECOND);
    setInterval(() => this.cullBots(), 10 * SECOND);
    setInterval(() => this.payDividends(), SECONDS_BETWEEN_DIVIDENDS * SECOND);
  }

  getRandomUserName() {
    return (
      _.sample([
        "Sexy",
        "Diamond",
        "Juicy",
        "Horny",
        "Paper",
        "Joe",
        "Badass",
        "Slow",
        "Deep",
        "1r0ny",
        "Roaring",
      ]) +
      _.sample([
        "Hands",
        "Slut",
        "Tendies",
        "Doge",
        "Ape",
        "Banana",
        "Waffle",
        "Kitten",
        "Ninja",
        "Value",
        "Man",
      ]) +
      Math.round(Math.random() * 90 + 10).toString()
    );
  }

  getUniqueUserName() {
    let name = this.getRandomUserName();
    let attempts = 0;
    while (this.usernamesUsed.has(name) && attempts < 50) {
      attempts++;
      name = this.getRandomUserName();
    }
    this.usernamesUsed.add(name);
    return name;
  }

  tickBots() {
    this.getBots().forEach((b) => b.tick());
  }

  addTrader(trader) {
    this.traders.push(trader);
    trader.startingNetWorth = this.getNetWorth(trader);
  }

  getAge() {
    return new Date() - this.createdAt;
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

  short(symbol, trader, numShares, socket) {
    if (trader.shares[symbol] > 0) return;

    let asset = this.getAssetBySymbol(symbol);
    let numSharesTraderCanAfford =
      (asset.poolShares -
        (asset.poolCash * asset.poolShares) /
          (asset.poolCash + this.getNetWorth(trader))) /
      this.maxMargin;

    if (numSharesTraderCanAfford < numShares) {
      numShares = Math.floor(numSharesTraderCanAfford);
    }

    let buyValue =
      (asset.poolCash * asset.poolShares) / (asset.poolShares - numShares) -
      asset.poolCash;

    trader.shares[symbol] -= numShares;
    trader.cash += buyValue;

    if (socket) {
      socket.emit("transaction", {
        type: "short",
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
      `🤑 \$${symbol} will go 📈${_.sample([
        "VERTICAL",
        "PARABOLIC",
        "NUCLEAR",
        "GALACTIC",
        "CRITICAL",
      ])}📈 very SOON 🚀`,
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
        narrativeUtils.generateCcgCard(),
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
    this.io.to(this.id).emit("hype-message", {
      text: this.generateShillMessage(symbol),
      name: trader.name,
      symbol: symbol,
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
    this.io.to(this.id).emit("prices", data);
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
      if (Math.random() < 0.51) {
        message = _.sample([
          `${asset.name} (\$${
            asset.symbol
          }) announces ${narrativeUtils.generateTechnologyProduct()} for Q${_.sample(
            [1, 2, 3, 4]
          )}`,
          `${narrativeUtils.generateCelebrity()} reveals purchase of ${_.sample(
            ["10k", "100k", "500k"]
          )} \$${Math.ceil(
            (1.5 + 2 * significance) * asset.price
          )} calls on \$${asset.symbol}`,
          `${asset.name} (\$${
            asset.symbol
          }) receives approval to open ${Math.round(
            significance * 20 + 2
          )} new dispensaries`,
          `Clinical trials show ${asset.name} (\$${asset.symbol}) ${_.sample([
            "synthetic cannabinoids",
            "psilocybin mushroom extracts",
          ])} hold promise for treating Groat's syndrome`,
          `Analyst: ${narrativeUtils.generateAstrologicalEvent()} a positive sign for \$${
            asset.symbol
          } price`,
        ]);
        asset.fundamentalPrice = Math.min(
          MAX_FUNDAMENTAL_PRICE,
          asset.fundamentalPrice * (1 + significance)
        );
        setTimeout(
          () => (asset.hype = 1 - (1 - asset.hype) * 0.75),
          (1 + Math.random()) * 5 * SECOND
        );
      } else {
        message = _.sample([
          `${Math.round(significance * 40 + 1)} injured in \$${
            asset.symbol
          }-related incident`,
          `${narrativeUtils.generateHackerOrg()} hackers exploit ${
            asset.name
          } (\$${asset.symbol}) zero-day vulnerability`,
          `${asset.name} (\$${asset.symbol}) announcements draw ${_.sample([
            "SEC",
            "FDA",
            "CFPB",
            "CFTC",
            "anti-trust",
            "congressional",
          ])} scrutiny`,
          `${asset.name} (\$${asset.symbol}) CEO ${_.sample([
            "arrested",
            "indicted",
          ])} on ${_.sample([
            "embezzlement",
            "drug",
            "DUI",
            "insider trading",
            "conspiracy",
          ])} charges`,
          `Analyst: ${narrativeUtils.generateAstrologicalEvent()} suggests \$${
            asset.symbol
          } likely to fall`,
        ]);
        asset.fundamentalPrice = Math.max(
          MIN_FUNDAMENTAL_PRICE,
          asset.fundamentalPrice / (1 + significance)
        );
      }
    }
    this.io.to(this.id).emit("news", { text: message });
  }

  getNetWorth(trader) {
    let netWorth = trader.cash;
    this.assets.forEach((asset) => {
      netWorth += trader.shares[asset.symbol] * asset.price;
    });
    return netWorth;
  }

  cullBots() {
    let quittingTraders = _.remove(
      this.traders,
      (t) =>
        t.type === constants.TRADER_TYPE_BOT &&
        this.getNetWorth(t) < BOT_QUITTING_THRESHOLD
    );
    quittingTraders.forEach((trader) => {
      this.botsCulledCount++;
      trader.sellEverything();
      // Bots can reuse names but players won't
      this.usernamesUsed.delete(trader.name);
    });

    if (this.getBots().length < DESIRED_BOT_COUNT) {
      this.addTrader(new Bot(this));
    }
  }

  removePlayer(id) {
    let removed = _.remove(this.traders, (t) => t.id === id);
    removed.forEach((trader) => {
      this.playersQuitCount++;
      trader.sellEverything();
      console.log(`player ${trader.name} is quitting`);
    });
  }

  broadcastLeaderboard() {
    let leaderboard = this.traders
      .map((trader) => ({
        name: trader.name,
        id: trader.id,
        netWorth: this.getNetWorth(trader).toFixed(2),
        cash: trader.cash.toFixed(2),
        profit: (
          this.getNetWorth(trader) -
          trader.startingNetWorth +
          trader.totalSpentOnUpgrades
        ).toFixed(2),
      }))
      .sort((a, b) => b.profit - a.profit);
    let rankLookup = {};
    for (let i = 0; i < leaderboard.length; i++) {
      rankLookup[leaderboard[i].id] = i + 1;
    }
    let top = leaderboard.slice(
      0,
      Math.min(LEADERBOARD_SIZE, leaderboard.length)
    );
    this.getPlayers().forEach((trader) => {
      trader.socket.emit("leaderboard", {
        rank: rankLookup[trader.id],
        total: leaderboard.length,
        top,
      });
    });
    if (Math.random() < 0.02) {
      this.io.to(this.id).emit("news", {
        text: `FOMO LOCO trader ${top[0].name} called to testify before House Committee on Financial Services`,
      });
    }
  }

  payDividends() {
    let dividends = {};
    this.assets.forEach(
      (asset) => (dividends[asset.symbol] = asset.fundamentalPrice * 0.0075)
    );
    if (Math.random() < 0.05) {
      this.io.to(this.id).emit("news", {
        text: `Dividends per share ${this.assets
          .map(
            (asset) =>
              `\$${asset.symbol} \$${dividends[asset.symbol].toFixed(4)}`
          )
          .join(", ")}`,
      });
    }
    this.traders.forEach((trader) => {
      let totalPayout = 0;
      this.assets.forEach(
        (asset) =>
          (totalPayout +=
            trader.shares[asset.symbol] > 0
              ? trader.shares[asset.symbol] * dividends[asset.symbol]
              : 0)
      );
      trader.cash += totalPayout;
      if (trader.type === constants.TRADER_TYPE_PLAYER) {
        trader.socket.emit("dividend", {
          totalPayout: totalPayout.toFixed(2),
          newCash: trader.cash.toFixed(2),
          timeToNextDividend: SECONDS_BETWEEN_DIVIDENDS,
        });
      }
    });
  }
}

module.exports = Market;
