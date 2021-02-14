class User {
  constructor(name, market) {
    this.name = name;
    this.cash = 100;
    this.shares = {};
    for (let asset of market.assets) {
      this.shares[asset.symbol] = 0;
    }
  }
}

module.exports = User;
