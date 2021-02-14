const _ = require("lodash");

class Bot {
  constructor(market) {
    this.name =
      _.sample(["Sexy", "Diamond", "Juicy", "Horny", "Paper"]) +
      _.sample(["Hands", "Slut", "Tendies"]) +
      Math.floor(Math.random() * 100 + 10).toString();
    this.cash = 100;
    this.shares = {};
    this.market = market;
    for (let asset of market.assets) {
      this.shares[asset.symbol] = 1;
    }
  }

  tick() {
    this.market.sell(_.sample(this.market.assets).symbol, this);
    this.market.buy(_.sample(this.market.assets).symbol, this);
    this.market.shill(_.sample(this.market.assets).symbol, this);
  }
}

module.exports = Bot;
