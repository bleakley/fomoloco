const constants = require("./constants");
const uuid = require("uuid");

const powerupCosts = { "short-selling": 1000, "short-interest": 500 };

const upgrades = {
  buy: {
    class: "Connection",
    levels: [
      { cost: 0, name: "28.8 kbps modem", description: "1x buy speed" },
      { cost: 150, name: "DSL", description: "2x buy speed" },
      { cost: 500, name: "gigabit fiber", description: "4x buy speed" },
      { cost: 1000, name: "HFT server", description: "8x buy speed" },
    ],
  },
  sell: {
    class: "Hardware",
    levels: [
      { cost: 0, name: "dirty keyboard", description: "1x sell speed" },
      { cost: 150, name: "clean keyboard", description: "2x sell speed" },
      { cost: 500, name: "gaming keyboard", description: "4x sell speed" },
      {
        cost: 1000,
        name: "gaming keyboard w/ LEDs",
        description: "8x sell speed",
      },
    ],
  },
  hype: {
    class: "Influence",
    levels: [
      { cost: 0, name: "basic account", description: "1x hype speed" },
      { cost: 150, name: "high karma account", description: "2x hype speed" },
      { cost: 500, name: "moderator account", description: "4x hype speed" },
      { cost: 1000, name: "botnet", description: "8x hype speed" },
    ],
  },
  volume: {
    class: "Platform",
    levels: [
      { cost: 0, name: "Nottingham app", description: "1x volume" },
      { cost: 1000, name: "brokerage account", description: "10x volume" },
      {
        cost: 2000,
        name: "brokerage backchannel",
        description: "100x volume",
      },
    ],
  },
};

class User {
  constructor(market, socket) {
    this.socket = socket;
    this.market = market;
    this.id = uuid.v4();
    this.name = `user-${this.id}`;
    this.suggestedName = market.getUniqueUserName();
    this.cash = 100;
    this.cash = 10000;
    this.shares = {};
    this.type = constants.TRADER_TYPE_PLAYER;
    this.upgrades = {
      buy: 0,
      sell: 0,
      hype: 0,
      volume: 0,
    };
    this.powerups = [];
    this.totalSpentOnUpgrades = 0;
    this.totalSpentOnPowerups = 0;
    for (let asset of market.assets) {
      this.shares[asset.symbol] = 0;
    }
  }

  upgrade(type, socket) {
    if (this.upgrades[type] + 1 >= upgrades[type].levels.length) {
      return false;
    }
    let cost = upgrades[type].levels[this.upgrades[type] + 1].cost;
    if (this.cash >= cost) {
      this.upgrades[type]++;
      this.cash -= cost;
      this.totalSpentOnUpgrades += cost;
      socket.emit("upgrade", {
        type,
        level: this.upgrades[type],
        cash: this.cash.toFixed(2),
      });
    }
  }

  buyPowerup(powerup, socket) {
    if (this.powerups.indexOf(powerup) > -1) {
      return false;
    }
    let cost = powerupCosts[powerup];
    if (this.cash >= cost) {
      this.cash -= cost;
      this.totalSpentOnPowerups += cost;
      socket.emit("powerup", {
        powerup: powerup,
        cash: this.cash.toFixed(2),
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
