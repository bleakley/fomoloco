const constants = require("./constants");
const uuid = require('uuid');

const upgradeCosts = [150, 250, 500, 1000];

class User {
  constructor(market, socket) {
    this.socket = socket;
    this.market = market;
    this.id = uuid.v4();
    this.name = `user-${this.id}`;
    this.cash = 100;
    this.shares = {};
    this.type = constants.TRADER_TYPE_PLAYER;
    this.upgrades = {
      buy: 0,
      sell: 0,
      hype: 0,
      volume: 0
    }
    this.totalSpentOnUpgrades = 0;
    for (let asset of market.assets) {
      this.shares[asset.symbol] = 0;
    }
  }

  upgrade(type, socket) {
    if (this.upgrades[type] >= upgradeCosts.length) {
      return false;
    }
    let cost = upgradeCosts[this.upgrades[type]];
    if (this.cash >= cost) {
      this.upgrades[type]++;
      this.cash -= cost;
      this.totalSpentOnUpgrades += cost;
      socket.emit("upgrade", {
        type,
        level: this.upgrades[type],
        cash: this.cash.toFixed(2)
      });
    }
  }

  sellEverything() {
    for (let i = 0; i < this.market.assets.length; i++) {
      let symbol = this.market.assets[i];
      if (this.shares[symbol] > 0) {
        this.market.sell(assetToSell.symbol, this, this.shares[symbol]);
      }
    }
  }
}

module.exports = User;
