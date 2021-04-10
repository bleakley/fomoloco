const constants = require("./constants");
const uuid = require("uuid");

const powerupCosts = {
  "short-selling": 1000,
  "market-metrics": 400,
  gift: 10,
  astrologer: 50,
};

const upgrades = {
  buy: {
    class: "Connection",
    levels: [
      { cost: 0, name: "28.8 kbps modem", description: "1x buy speed" },
      { cost: 40, name: "DSL", description: "2x buy speed" },
      { cost: 200, name: "gigabit fiber", description: "4x buy speed" },
      {
        cost: 1000,
        name: "co-located HFT server",
        description: "8x buy speed",
      },
    ],
  },
  sell: {
    class: "Hardware",
    levels: [
      { cost: 0, name: "dirty keyboard", description: "1x sell/short speed" },
      { cost: 40, name: "clean keyboard", description: "2x sell/short speed" },
      {
        cost: 200,
        name: "gaming keyboard",
        description: "4x sell/short speed",
      },
      {
        cost: 1000,
        name: "gaming keyboard w/ LEDs",
        description: "8x sell/short speed",
      },
    ],
  },
  hype: {
    class: "Influence",
    levels: [
      { cost: 0, name: "basic account", description: "1x hype speed" },
      { cost: 40, name: "high karma account", description: "2x hype speed" },
      { cost: 200, name: "moderator account", description: "4x hype speed" },
      { cost: 1000, name: "distributed botnet", description: "8x hype speed" },
    ],
  },
  volume: {
    class: "Platform",
    levels: [
      { cost: 0, name: "Nottingham app", description: "1x volume" },
      { cost: 600, name: "brokerage account", description: "10x volume" },
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
    this.suggestedName = market.getUniqueUserName();
    this.name = this.suggestedName;
    this.cash = 30;
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

      if (powerup === "astrologer") {
        setTimeout(() => {
          this.cash += Math.random() * 100 + 50;
          socket.emit("gift", {
            newCash: this.cash.toFixed(2),
          });
        }, Math.random() * 5000 + 5000);
      }
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
