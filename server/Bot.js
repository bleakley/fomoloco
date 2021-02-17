const _ = require("lodash");
const utils = require("./utils");
const constants = require("./constants");

class Bot {
  constructor(market) {
    this.name =
      _.sample([
        "Sexy",
        "Diamond",
        "Juicy",
        "Horny",
        "Paper",
        "Joe",
        "Badass",
        "Slow",
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
      ]) +
      Math.round(Math.random() * 90 + 10).toString();
    this.cash = 100;
    this.totalSpentOnUpgrades = 0;
    this.shares = {};
    this.market = market;
    this.shillCoolDownTime = 20000;
    this.lastShillTime = Date.now() - Math.random() * this.shillCoolDownTime;

    // Weights must sum to 1
    this.hypeWeight = Math.random();
    this.velocityWeight = Math.random();
    this.fundamentalWeight = 0.5 * 0.5 * Math.random();
    let totalWeight =
      this.hypeWeight + this.velocityWeight + this.fundamentalWeight;
    this.hypeWeight /= totalWeight;
    this.velocityWeight /= totalWeight;
    this.fundamentalWeight /= totalWeight;

    this.focus = 0.25 * Math.random() + 0.25;
    this.type = constants.TRADER_TYPE_BOT;

    for (let asset of market.assets) {
      this.shares[asset.symbol] = 1;
    }
  }

  tick() {
    if (Math.random() < 0.3) {
      this.sellSomething();
    }
    if (Math.random() < 0.4) {
      this.buySomething();
    }
    if (Math.random() < 0.1) {
      setTimeout(() => this.shillSomething(), Math.random() * 2000);
    }
  }

  sellSomething() {
    let assetsHeld = this.market.assets.filter(
      (asset) => this.shares[asset.symbol] > 0
    );
    if (assetsHeld.length === 0) {
      return;
    }
    let assetToSell = utils.sampleWeighted(assetsHeld, (asset) =>
      Math.pow(1 - this.getAssetSentiment(asset), this.focus)
    );
    this.market.sell(assetToSell.symbol, this, 1);
  }

  sellEverything() {
    for (let i = 0; i < this.market.assets.length; i++) {
      let symbol = this.market.assets[i];
      if (this.shares[symbol] > 0) {
        this.market.sell(assetToSell.symbol, this, this.shares[symbol]);
      }
    }
  }

  buySomething() {
    let assetToBuy = utils.sampleWeighted(this.market.assets, (asset) =>
      Math.pow(this.getAssetSentiment(asset), this.focus)
    );
    this.market.buy(assetToBuy.symbol, this, 1);
  }

  shillSomething() {
    if (Date.now() - this.lastShillTime < this.shillCoolDownTime) return;

    let favoriteAsset = utils.sampleWeighted(this.market.assets, (asset) =>
      Math.pow(
        this.shares[asset.symbol] * asset.price * (0.1 + 0.9 * asset.hype),
        this.focus
      )
    );

    if (Math.random() < 0.1 + 0.9 * favoriteAsset.hype) {
      this.lastShillTime = Date.now();
      this.market.shill(favoriteAsset.symbol, this);
    }
  }

  getAssetSentiment(asset) {
    // Asset sentiment must be between 0 and 1
    let sentiment = this.hypeWeight * asset.hype;
    sentiment +=
      this.velocityWeight *
      (Math.min(Math.max(asset.velocity, 2), -2) / 4 + 0.5);
    sentiment +=
      this.fundamentalWeight *
      (1 -
        ((Math.min(asset.price - asset.fundamentalPrice) /
          asset.fundamentalPrice,
        4) +
          1) /
          5);
    if (sentiment > 1) {
      console.log(`Warning sentiment is greater than 1: ${sentiment}`);
      sentiment = 1;
    }
    if (sentiment < 0) {
      console.log(`Warning sentiment is greater than 1: ${sentiment}`);
      sentiment = 0;
    }
    return sentiment;
  }
}

module.exports = Bot;
