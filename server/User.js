const constants = require("constants");

class User {
  constructor(name, market) {
    this.name = name;
    this.cash = 100;
    this.shares = {};
    this.type = constants.TRADER_TYPE_PLAYER;
    for (let asset of market.assets) {
      this.shares[asset.symbol] = 0;
    }
  }
}

module.exports = User;
