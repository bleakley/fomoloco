const _ = require("lodash");
const narrativeUtils = require("./narrativeUtils.js");

const SECOND = 1000;
const MAX_FUNDAMENTAL_PRICE = 200;
const MIN_FUNDAMENTAL_PRICE = 0.05;

class Asset {
  constructor(name, symbol, color) {
    this.name = name;
    this.symbol = symbol;
    this.color = color;
    this.poolShares = 100;
    this.poolCash = 100;
    this.hype = 0;
    this.velocity = 0;
    this.brokerShares = 0;
    this.price = this.poolCash / this.poolShares;
    this.previousPrice = this.price;
    this.fundamentalPrice = this.price;
    this.boosted = false;
  }

  updateMarketMetrics() {
    this.velocity = (this.price - this.previousPrice) / this.previousPrice;
    this.previousPrice = 0.5 * this.previousPrice + 0.5 * this.price;
    this.hype = this.hype * 0.95;
  }

  getBuyValue(numShares) {
    return (
      (this.poolCash * this.poolShares) / (this.poolShares - numShares) -
      this.poolCash
    );
  }

  buy(numShares) {
    if (numShares <= 0) {
      console.log(`Invalid request to buy ${numShares} of ${this.symbol}.`);
      return;
    }
    if (numShares > this.poolShares) {
      console.log(
        `Invalid request to buy ${numShares} of ${this.symbol}. Only ${this.poolShares} are available.`
      );
      return;
    }
    let buyValue = this.getBuyValue(numShares);
    this.poolShares -= numShares;
    this.poolCash += buyValue;
    this.price = buyValue / numShares;
  }

  getSellValue(numShares) {
    return (
      this.poolCash -
      (this.poolCash * this.poolShares) / (this.poolShares + numShares)
    );
  }

  sell(numShares) {
    if (numShares <= 0) {
      console.log(`Invalid request to sell ${numShares} of ${this.symbol}.`);
      return;
    }
    let sellValue = this.getSellValue(numShares);
    this.poolShares += numShares;
    this.poolCash -= sellValue;
    this.price = sellValue / numShares;
  }

  generateExuberantNews() {
    return _.sample([
      `Analysts say \$${this.symbol} trading ${Math.round(
        this.price / this.fundamentalPrice
      )} times above target`,
      `${_.sample([
        "Fed chairman warns",
        "Fintech CEO warns",
        "Hedge fund manager warns",
        "Regulators warn",
      ])} of ${_.sample([
        '"irrational exuberance"',
        '"unusual" market volatility',
        '"imminent" collapse',
      ])} in \$${this.symbol} price`,
    ]);
  }

  generatePositiveNews(significance) {
    if (Math.random() < 0.05 && this.boosted) {
      return `Retailers report consumer demand is surging for ${this.name} (\$${this.symbol}) products`;
    }

    return _.sample([
      `${this.name} (\$${
        this.symbol
      }) announces ${narrativeUtils.generateTechnologyProduct()} for Q${_.sample(
        [1, 2, 3, 4]
      )}`,
      `${narrativeUtils.generateCelebrity()} reveals purchase of ${_.sample(
        ["10k", "100k", "500k"]
      )} \$${Math.ceil(
        (1.5 + 2 * significance) * this.price
      )} calls on \$${this.symbol}${_.sample([
        "",
        "",
        ': "I like the stock"',
        ': "The fundamentals are strong"',
      ])}`,
      `${this.name} (\$${
        this.symbol
      }) receives approval to open ${Math.round(
        significance * 20 + 2
      )} new dispensaries`,
      `Clinical trials show ${this.name} (\$${this.symbol}) ${_.sample([
        "synthetic cannabinoids",
        "psilocybin mushroom extracts",
      ])} hold promise for treating Groat's syndrome`,
      `Analyst: ${narrativeUtils.generateAstrologicalEvent()} a positive sign for \$${
        this.symbol
      } price`,
    ]);
  }

  generateNegativeNews(significance) {
    return _.sample([
      `${Math.round(significance * 40 + 1)} injured in \$${
        this.symbol
      }-related incident`,
      `${narrativeUtils.generateHackerOrg()} hackers exploit ${
        this.name
      } (\$${this.symbol}) zero-day vulnerability`,
      `${this.name} (\$${this.symbol}) announcements draw ${_.sample([
        "SEC",
        "FDA",
        "CFPB",
        "CFTC",
        "anti-trust",
        "congressional",
      ])} scrutiny`,
      `${this.name} (\$${this.symbol}) CEO ${_.sample([
        "arrested",
        "indicted",
      ])} on ${_.sample([
        "embezzlement",
        "drug",
        "DUI",
        "insider trading",
        "conspiracy",
      ])} charges`,
      `Analyst: ${narrativeUtils.generateAstrologicalEvent()} suggests \$${
        this.symbol
      } likely to fall`,
    ]);
  }

  generateCompetitiveNews(enemyAsset, significance) {
    let court = `${_.sample(['Nevada', 'Florida', 'California', 'U.S.'])} Supreme Court`;
    let patent = _.sample(['"leftPad"', '"rangeCheck"', '"rightPad"', 'AI', 'blockchain', 'self-driving car', 'drone delivery', '"loot box"']);
    return `${court} rules ${enemyAsset.name} (\$${enemyAsset.symbol}) infringed on ${this.name} (\$${this.symbol}) ${patent} patent`;
  }

  applyNewsBonus(significance) {
    this.fundamentalPrice = Math.min(
      MAX_FUNDAMENTAL_PRICE,
      this.fundamentalPrice * (1 + significance)
    );
    setTimeout(
      () => (this.hype = 1 - (1 - this.hype) * 0.75),
      (1 + Math.random()) * 5 * SECOND
    );
  }

  applyNewsPenalty(significance) {
    this.fundamentalPrice = Math.max(
      MIN_FUNDAMENTAL_PRICE,
      this.fundamentalPrice / (1 + significance)
    );
  }
}

module.exports = Asset;
