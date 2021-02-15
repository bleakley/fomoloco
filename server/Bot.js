const _ = require("lodash");
const utils = require("./utils");

const TRADER_TYPE_BOT = 0;

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
    this.shares = {};
    this.market = market;
    this.hypeWeight = Math.random();
    this.velocityWeight = Math.random();
    this.fundamentalWeight = Math.random();
    this.focus = 2 * Math.random() + 0.5;
    this.type = TRADER_TYPE_BOT;

    for (let asset of market.assets) {
      this.shares[asset.symbol] = 1;
    }
  }

  tick() {
    if (Math.random() < 0.3) {
      this.sellSomething();
    }
    if (Math.random() < 0.3) {
      this.buySomething();
    }
    if (Math.random() < 0.3) {
      this.shillSomething();
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
    this.market.sell(assetToSell.symbol, this);
  }

  buySomething() {
    let assetToBuy = utils.sampleWeighted(this.market.assets, (asset) =>
      Math.pow(this.getAssetSentiment(asset), this.focus)
    );
    this.market.buy(assetToBuy.symbol, this);
  }

  shillSomething() {
    let favoriteAsset = utils.sampleWeighted(this.market.assets, (asset) =>
      Math.pow(this.shares[asset.symbol] * asset.price, this.focus)
    );
    this.market.shill(favoriteAsset.symbol, this);
  }

  getAssetSentiment(asset) {
    return (
      this.hypeWeight * asset.hype +
      this.velocityWeight *
        (Math.min(Math.max(asset.velocity, 2), -2) / 4 + 0.5)
    );
  }
}

module.exports = Bot;
