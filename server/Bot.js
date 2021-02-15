const _ = require("lodash");

const TRADER_TYPE_BOT = 0;

class Bot {
  constructor(market) {
    this.name =
      _.sample(["Sexy", "Diamond", "Juicy", "Horny", "Paper"]) +
      _.sample(["Hands", "Slut", "Tendies"]) +
      Math.floor(Math.random() * 100 + 10).toString();
    this.cash = 100;
    this.shares = {};
    this.market = market;
    this.hypeWeight = Math.random();
    this.velocityWeight = Math.random();
    this.type = TRADER_TYPE_BOT;

    for (let asset of market.assets) {
      this.shares[asset.symbol] = 1;
    }
  }

  tick() {
    if (Math.random() < 0.5) {
      this.sellSomething();
    }
    if (Math.random() < 0.5) {
      this.buySomething();
    }
    if (Math.random() < 0.5) {
      this.buySomethingRandom();
    }
    if (Math.random() < 0.5) {
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
    let assetToSell = _.sample(assetsHeld);
    assetsHeld.forEach((asset) => {
      if (this.getAssetSentiment(asset) < this.getAssetSentiment(assetToSell)) {
        assetToSell = asset;
      }
    });
    this.market.sell(assetToSell.symbol, this);
  }

  buySomethingRandom() {
    this.market.buy(_.sample(this.market.assets).symbol, this);
  }

  buySomething() {
    let favoriteAsset = _.sample(this.market.assets);
    this.market.assets.forEach((asset) => {
      if (
        this.getAssetSentiment(asset) > this.getAssetSentiment(favoriteAsset)
      ) {
        favoriteAsset = asset;
      }
    });
    this.market.buy(favoriteAsset.symbol, this);
  }

  shillSomething() {
    let favoriteAsset = _.sample(this.market.assets);
    this.market.assets.forEach((asset) => {
      if (
        this.shares[asset.symbol] * asset.price >
        this.shares[favoriteAsset.symbol] * favoriteAsset.price
      ) {
        favoriteAsset = asset;
      }
    });
    this.market.shill(favoriteAsset.symbol, this);
  }

  getAssetSentiment(asset) {
    return this.hypeWeight * asset.hype + this.velocityWeight * asset.velocity;
  }
}

module.exports = Bot;
