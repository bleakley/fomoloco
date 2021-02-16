const constants = require("constants");

const upgradeCosts = [150, 250, 500, 1000];

class User {
  constructor(name, market) {
    this.name = name;
    this.cash = 1000;
    this.shares = {};
    this.type = constants.TRADER_TYPE_PLAYER;
    this.upgrades = {
      buy: 0,
      sell: 0,
      hype: 0,
      volume: 0
    }
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
      socket.emit("upgrade", {
        type,
        level: this.upgrades[type],
        cash: this.cash
      });
    }
  }
}

module.exports = User;
