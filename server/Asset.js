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
}

module.exports = Asset;
