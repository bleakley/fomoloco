const _ = require("lodash");
const utils = require("./utils.js");
const narrativeUtils = require("./narrativeUtils.js");
const constants = require("./constants");
const Asset = require("./Asset.js");
const SECOND = 1000;
const Bot = require("./Bot.js");
const uuid = require("uuid");

const LEADERBOARD_SIZE = 10;
const BOT_QUITTING_THRESHOLD = 10;
const DESIRED_BOT_COUNT = 15;
const SECONDS_BETWEEN_DIVIDENDS = 60;
const SECONDS_BETWEEN_MARGIN_CHECKS = 20;
const SECONDS_BETWEEN_MARKET_METRICS_BROADCASTS = 5;
const SECONDS_BROKER_SETTLEMENT = 10;

class Market {
  constructor(io) {
    this.io = io;
    this.id = uuid.v4();
    this.createdAt = new Date();
    this.generateInitialAssets();
    this.traders = [];
    this.botsCulledCount = 0;
    this.playersQuitCount = 0;
    this.maxMargin = 2;

    this.usernamesUsed = new Set();

    for (let i = 0; i < DESIRED_BOT_COUNT; i++) {
      this.addTrader(new Bot(this, this.getUniqueUserName()));
    }

    setInterval(() => this.broadcastPrices(), 1 * SECOND);
    setInterval(() => this.generateNews(), 20 * SECOND);
    setInterval(() => this.updateMarketMetrics(), 1 * SECOND);
    setInterval(() => this.broadcastLeaderboard(), 5 * SECOND);
    setInterval(() => this.tickBots(), 1 * SECOND);
    setInterval(() => this.cullBots(), 10 * SECOND);
    setInterval(() => this.payDividends(), SECONDS_BETWEEN_DIVIDENDS * SECOND);
    setInterval(
      () => this.broadcastMarketMetrics(),
      SECONDS_BETWEEN_MARKET_METRICS_BROADCASTS * SECOND
    );

    setInterval(
      () => this.checkMargins(),
      SECONDS_BETWEEN_MARGIN_CHECKS * SECOND
    );
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
        "Fast",
        "Deep",
        "1r0ny",
        "Roaring",
        "Stock",
        "Coin",
        "Hungry",
        "Hype",
        "Crypto",
        "Market",
        "Gay",
        "Lady",
        "Thirsty",
        "Based",
        "Cringe",
        "1337",
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
        "Woman",
        "Boy",
        "Girl",
        "Surfer",
        "Dude",
        "Dog",
        "Cat",
        "Shill",
        "Beast",
        "Pepe",
        "Trader",
        "Bull",
        "Bear",
        "Pig",
        "Piggy",
        "Hacker",
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
      new Asset("Bluberrry Technologies", "BB", "#1f77b4"),
      new Asset("Mooncoin", "MNC", "#2ca02c"),
      new Asset("Brook Video Rental", "BVR", "#ff7f0e"),
      new Asset("Sundog Growers", "SDG", "#d62728"),
    ];
  }

  boost(symbol) {
    this.assets.forEach((a) => (a.boosted = a.symbol === symbol.toUpperCase()));
  }

  getAssetBySymbol(symbol) {
    return this.assets.filter((a) => a.symbol === symbol)[0];
  }

  updateMarketMetrics() {
    this.assets.forEach((asset) => asset.updateMarketMetrics());
  }

  buy(symbol, trader, numShares, socket) {
    let asset = this.getAssetBySymbol(symbol);

    let numSharesTraderCanAfford =
      asset.poolShares -
      (asset.poolCash * asset.poolShares) / (asset.poolCash + trader.cash);

    if (numSharesTraderCanAfford < numShares) {
      numShares = Math.floor(numSharesTraderCanAfford);
    }

    let buyValue = asset.getBuyValue(numShares);
    let valid = asset.buy(numShares);
    if (!valid) {
      return;
    }

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

  closeOut(symbol, trader, numShares, socket) {
    let asset = this.getAssetBySymbol(symbol);

    let numSharesTraderCanAfford =
      asset.poolShares -
      (asset.poolCash * asset.poolShares) / (asset.poolCash + trader.cash);

    if (numSharesTraderCanAfford < numShares) {
      numShares = Math.floor(numSharesTraderCanAfford);
    }

    if (numShares > -trader.shares[symbol]) {
      numShares = -trader.shares[symbol];
    }

    let buyValue = asset.getBuyValue(numShares);
    let valid = asset.buy(numShares);
    if (!valid) {
      return;
    }
    trader.shares[symbol] += numShares;
    asset.brokerShares += numShares;
    trader.cash -= buyValue;

    if (socket) {
      socket.emit("transaction", {
        type: "close-out",
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

    if (numShares <= 0) {
      return;
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

  liquidate(asset, trader, value) {
    if (trader.shares[asset.symbol] <= 0) return 0;
    let numShares =
      (asset.poolCash * asset.poolShares) / (asset.poolCash - value) -
      asset.poolShares;
    numShares = Math.ceil(numShares);
    numShares = Math.min(trader.shares[asset.symbol], numShares);
    let liquidationValue = asset.getSellValue(numShares);
    let valid = asset.sell(numShares);
    if (!valid) {
      return 0;
    }
    
    trader.shares[asset.symbol] -= numShares;

    return liquidationValue;
  }

  forceCloseOut(asset, trader, value) {
    if (trader.shares[asset.symbol] >= 0) return 0;

    let numShares = Math.floor(
      asset.poolShares -
        (asset.poolCash * asset.poolShares) / (asset.poolCash + value)
    );

    numShares = Math.min(numShares, -trader.shares[asset.symbol]);

    let closeOutValue = asset.getBuyValue(numShares);
    let valid = asset.buy(numShares);
    if (!valid) {
      return;
    }
    asset.brokerShares += numShares;
    trader.shares[asset.symbol] += numShares;
    return closeOutValue;
  }

  sell(symbol, trader, numShares, socket) {
    numShares = Math.min(numShares, trader.shares[symbol]);

    if (numShares <= 0) {
      return;
    }

    let asset = this.getAssetBySymbol(symbol);
    let sellValue = asset.getSellValue(numShares);

    let valid = asset.sell(numShares);
    if (!valid) {
      return;
    }

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
      narrativeUtils.generateLyric(symbol),
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
      `I'm so HORNY for \$${symbol} 😍🥵💦`,
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
      data.push({
        symbol: asset.symbol,
        price: asset.price.toFixed(2),
      });
    }
    this.io.to(this.id).emit("prices", data);
  }

  broadcastMarketMetrics() {
    let data = [];
    for (let asset of this.assets) {
      data.push({
        symbol: asset.symbol,
        shortInterest: this.getShortInterest(asset),
        dividendRate: this.getDividendRate(asset),
        hype: asset.hype,
      });
    }
    this.io.to(this.id).emit("market-metrics", data);
  }

  getExuberance(asset) {
    return Math.max(asset.price / asset.fundamentalPrice - 1, 0) + 0.01;
  }

  generateNews() {
    let message;
    let asset = utils.sampleWeighted(this.assets, (asset) =>
      this.getExuberance(asset)
    );
    if (this.getExuberance(asset) > 1 && Math.random() < 0.1) {
      message = asset.generateExuberantNews();
    } else {
      asset = _.sample(this.assets);
      let significance = Math.random();
      let chanceOfCompetition = 0.05;
      let chanceOfGoodNews = asset.boosted ? 0.8 : 0.7;
      if (Math.random() < chanceOfCompetition) {
        let enemyAsset = _.sample(
          this.assets.filter((a) => a.symbol !== asset.symbol)
        );
        message = asset.generateCompetitiveNews(enemyAsset, significance);
        asset.applyNewsBonus(significance);
        enemyAsset.applyNewsPenalty(significance);
      } else if (Math.random() < chanceOfGoodNews) {
        message = asset.generatePositiveNews(significance);
        asset.applyNewsBonus(significance);
      } else {
        message = asset.generateNegativeNews(significance);
        asset.applyNewsPenalty(significance);
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
      this.addTrader(new Bot(this, this.getUniqueUserName()));
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
    const makeLeaderboardEntry = (trader) => ({
      name: trader.name,
      id: trader.id,
      type: trader.type,
      profit: (
        this.getNetWorth(trader) -
        trader.startingNetWorth +
        trader.totalSpentOnUpgrades +
        trader.totalSpentOnPowerups
      ).toFixed(2),
    });

    let leaderboard = this.traders
      .map((trader) => makeLeaderboardEntry(trader))
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
        you: makeLeaderboardEntry(trader),
        rank: rankLookup[trader.id],
        count: this.traders.length,
        top,
      });
    });
    if (Math.random() < 0.02) {
      this.io.to(this.id).emit("news", {
        text: `FOMO LOCO trader ${top[0].name} called to testify before House Committee on Financial Services`,
      });
    }
  }

  getShortInterest(asset) {
    let shortedShares = 0;
    let totalShares = asset.poolShares + asset.brokerShares;
    this.traders.forEach((trader) => {
      if (trader.shares[asset.symbol] < 0) {
        shortedShares -= trader.shares[asset.symbol];
      } else {
        totalShares += trader.shares[asset.symbol];
      }
    });
    return shortedShares / totalShares;
  }

  getDividendRate(asset) {
    return asset.fundamentalPrice * 0.01;
  }

  payDividends() {
    let dividends = {};
    this.assets.forEach(
      (asset) => (dividends[asset.symbol] = this.getDividendRate(asset))
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

  checkMargins() {
    this.traders.forEach((trader) => {
      let totalHoldings = trader.cash;
      let totalBorrowed = 0;
      this.assets.forEach((asset) => {
        totalHoldings +=
          trader.shares[asset.symbol] > 0
            ? trader.shares[asset.symbol] * asset.price
            : 0;
        totalBorrowed -=
          trader.shares[asset.symbol] < 0
            ? trader.shares[asset.symbol] * asset.price
            : 0;
      });

      let maxCanBorrow = totalHoldings / this.maxMargin;
      if (totalBorrowed > maxCanBorrow) {
        let valueToLiquidate =
          (this.maxMargin * totalBorrowed - totalHoldings) /
          (this.maxMargin - 1);
        let liquidatedCash = 0;

        if (trader.cash > valueToLiquidate) {
          liquidatedCash += valueToLiquidate;
          trader.cash -= valueToLiquidate;
        } else {
          liquidatedCash += trader.cash;
          trader.cash = 0;
        }

        _.shuffle(this.assets).map((asset) => {
          liquidatedCash += this.liquidate(
            asset,
            trader,
            valueToLiquidate - liquidatedCash
          );
        });

        _.shuffle(this.assets).map((asset) => {
          liquidatedCash -= this.forceCloseOut(asset, trader, liquidatedCash);
        });

        trader.cash += liquidatedCash;
      }
      if (trader.type === constants.TRADER_TYPE_PLAYER) {
        trader.socket.emit("margin-call", {
          newCash: trader.cash.toFixed(2),
          newShares: trader.shares,
          timeToNextMarginCheck: SECONDS_BETWEEN_MARGIN_CHECKS,
        });
      }
    });
    setTimeout(() => this.settleBrokers(), SECONDS_BROKER_SETTLEMENT);
  }

  settleBrokers() {
    this.assets.forEach((asset) => {
      if (asset.brokerShares > 0) {
        asset.sell(asset.brokerShares);
        asset.brokerShares = 0;
      }
    });
  }
}

module.exports = Market;
