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
  let initialPoolCash = asset.poolCash;
  market.sell(asset.symbol, testTrader, 1);
  expect(asset.poolShares).toBe(initialPoolShares + 1);
  expect(testTrader.shares[asset.symbol]).toBe(initialTraderShares - 1);
  expect(asset.price).toBe(initialPoolCash - asset.poolCash);
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

test("liquidate all shares", () => {
  // Given
  let market = getTestMarket();
  let testTrader = market.traders[0];
  let asset = market.assets[0];
  asset.poolShares = 100;
  asset.poolCash = 100;
  testTrader.shares[asset.symbol] = 1;
  testTrader.cash = 0;

  let initialPoolShares = asset.poolShares;
  let initialTraderShares = testTrader.shares[asset.symbol];
  let initialPoolCash = asset.poolCash;

  // When
  liquidationValue = market.liquidate(asset, testTrader, 100);

  // Then
  expect(asset.poolShares).toBe(initialPoolShares + initialTraderShares);
  expect(asset.price).toBe(
    (initialPoolCash - asset.poolCash) / initialTraderShares
  );
  expect(testTrader.shares[asset.symbol]).toBe(0);
  expect(liquidationValue).toBe(initialPoolCash - asset.poolCash);
});

test("force close out", () => {
  // Given
  let market = getTestMarket();
  let testTrader = market.traders[0];
  let asset = market.assets[0];
  asset.poolShares = 100;
  asset.poolCash = 100;
  asset.brokerShares = 0;
  testTrader.shares[asset.symbol] = -1;
  testTrader.cash = 0;

  let initialPoolShares = asset.poolShares;

  // When
  let buyValue = asset.getBuyValue(1);
  let closeOutValue = market.forceCloseOut(asset, testTrader, buyValue + 1);

  // Then
  expect(asset.poolShares).toBe(initialPoolShares - 1);
  expect(testTrader.shares[asset.symbol]).toBe(0);
  expect(asset.brokerShares).toBe(1);
  expect(closeOutValue).toBe(buyValue);
});

test("force close out unowned asset", () => {
  // Given
  let market = getTestMarket();
  let testTrader = market.traders[0];
  let asset = market.assets[0];
  asset.poolShares = 100;
  asset.poolCash = 100;
  asset.brokerShares = 0;
  testTrader.shares[asset.symbol] = 0;
  testTrader.cash = 0;

  let initialPoolShares = asset.poolShares;

  // When
  let buyValue = asset.getBuyValue(1);
  let closeOutValue = market.forceCloseOut(asset, testTrader, buyValue + 1);

  // Then
  expect(asset.poolShares).toBe(initialPoolShares);
  expect(testTrader.shares[asset.symbol]).toBe(0);
  expect(asset.brokerShares).toBe(0);
  expect(closeOutValue).toBe(0);
});

test("margin call", () => {
  // Given
  let market = getTestMarket();
  let testTrader = market.traders[0];
  let asset = market.assets[0];
  asset.poolShares = 100;
  asset.poolCash = 100;
  asset.brokerShares = 0;
  testTrader.shares[asset.symbol] = -10;
  testTrader.cash = 5;

  let initialPoolShares = asset.poolShares;
  let initialTraderShares = testTrader.shares[asset.symbol];
  let initialTraderCash = testTrader.cash;

  // When
  market.checkMargins();

  // Then
  let sharesClosedOut = initialPoolShares - asset.poolShares;
  expect(sharesClosedOut).toBeGreaterThan(0);
  expect(testTrader.shares[asset.symbol] - initialTraderShares).toBe(
    sharesClosedOut
  );
  expect(asset.brokerShares).toBe(sharesClosedOut);
  expect(asset.price).toBeGreaterThan(0);
  expect(testTrader.cash).toBeLessThan(initialTraderCash);
});
