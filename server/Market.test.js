const Market = require("./Market");
const uuid = require("uuid");

function getTestMarket() {
  let market = new Market();

  let testTrader = {
    name: "test trader",
    id: uuid.v4(),
    cash: 60,
    totalSpentOnUpgrades: 0,
    totalSpentOnPowerups: 0,
    shares: {},
    market: market,
  };

  for (let asset of market.assets) {
    testTrader.shares[asset.symbol] = 1;
  }
  market.addTrader(testTrader);
  return market;
}

test("buy asset", () => {
  let market = getTestMarket();
  let testTrader = market.traders[0];
  let asset = market.assets[0];
  let initialPoolShares = asset.poolShares;
  let initialTraderShares = testTrader.shares[asset.symbol];
  market.buy(asset.symbol, testTrader, 1);
  expect(asset.poolShares).toBe(initialPoolShares - 1);
  expect(testTrader.shares[asset.symbol]).toBe(initialTraderShares + 1);
});

test("sell asset", () => {
  let market = getTestMarket();
  let testTrader = market.traders[0];
  let asset = market.assets[0];
  let initialPoolShares = asset.poolShares;
  let initialTraderShares = testTrader.shares[asset.symbol];
  market.sell(asset.symbol, testTrader, 1);
  expect(asset.poolShares).toBe(initialPoolShares + 1);
  expect(testTrader.shares[asset.symbol]).toBe(initialTraderShares - 1);
});

test("short", () => {
  let market = getTestMarket();
  let testTrader = market.traders[0];
  let asset = market.assets[0];
  testTrader.shares[asset.symbol] = 0;
  let initialPoolShares = asset.poolShares;
  let initialbrokerShares = asset.brokerShares;
  market.short(asset.symbol, testTrader, 1);
  expect(asset.poolShares).toBe(initialPoolShares);
  expect(asset.brokerShares).toBe(initialbrokerShares);
  expect(testTrader.shares[asset.symbol]).toBe(-1);
});
