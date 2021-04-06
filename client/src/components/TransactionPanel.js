import React, { Component } from "react";
import _ from "lodash";
import { CircularProgress, Typography, Button, Box } from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";

function CooldownTimer(props) {
  if (!props.current) {
    return null;
  }
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress
        size={20}
        variant="determinate"
        value={(100 * props.current) / props.max}
      />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="caption" component="div" color="textSecondary">
          {props.current.toFixed(0)}
        </Typography>
      </Box>
    </Box>
  );
}

class TransactionButton extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Button
        size="small"
        color="primary"
        onClick={this.props.onClick}
        disabled={Boolean(this.props.time) || this.props.disabled}
      >
        {this.props.label}{" "}
        <CooldownTimer current={this.props.time} max={this.props.cooldown} />
      </Button>
    );
  }
}

class TransactionPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buyTime: 0,
      sellTime: 0,
      hypeTime: 0,
      lastDividend: 0,
      timeToNextDividend: 60,
      timeToNextMarginCheck: 20,
      marketMetrics: [],
    };

    setInterval(() => {
      this.setState({
        buyTime: Math.max(0, this.state.buyTime - 0.1),
        sellTime: Math.max(0, this.state.sellTime - 0.1),
        hypeTime: Math.max(0, this.state.hypeTime - 0.1),
        timeToNextDividend: Math.max(0, this.state.timeToNextDividend - 0.1),
        timeToNextMarginCheck: Math.max(
          0,
          this.state.timeToNextMarginCheck - 0.1
        ),
      });
    }, 100);

    this.props.socket.on("dividend", (transaction) => {
      this.setState({
        lastDividend: transaction.totalPayout,
        timeToNextDividend: transaction.timeToNextDividend,
      });
    });

    this.props.socket.on("margin-call", (marginCallEvent) => {
      this.setState({
        timeToNextMarginCheck: marginCallEvent.timeToNextMarginCheck,
      });
    });

    this.props.socket.on("market-metrics", (marketMetrics) => {
      this.setState({
        marketMetrics,
      });
    });
  }

  getMargin() {
    let totalHoldings = parseFloat(this.props.cash);
    let totalBorrowed = 0;
    Object.keys(this.props.playerHoldings).forEach((symbol) => {
      if (this.props.playerHoldings[symbol]) {
        if (this.props.playerHoldings[symbol] > 0) {
          totalHoldings +=
            this.props.playerHoldings[symbol] *
            parseFloat(this.props.currentPrices[symbol]);
        } else {
          totalBorrowed -=
            this.props.playerHoldings[symbol] *
            parseFloat(this.props.currentPrices[symbol]);
        }
      }
    });
    if (totalBorrowed === 0) return null;
    else return ((100 * totalHoldings) / totalBorrowed).toFixed(0);
  }

  isMarginSafe() {
    return this.getMargin() > 150;
  }

  buy(symbol, cooldown) {
    setTimeout(() => {
      this.props.socket.emit("buy-asset", {
        symbol: symbol,
        shares: 10 ** this.props.upgrades.volume,
      });
    }, 1000 * cooldown);
    this.setState({
      buyTime: cooldown,
    });
  }

  closeOut(symbol, cooldown) {
    setTimeout(() => {
      this.props.socket.emit("close-out-asset", {
        symbol: symbol,
        shares: 10 ** this.props.upgrades.volume,
      });
    }, 1000 * cooldown);
    this.setState({
      buyTime: cooldown,
    });
  }

  sell(symbol, cooldown) {
    setTimeout(() => {
      this.props.socket.emit("sell-asset", {
        symbol: symbol,
        shares: 10 ** this.props.upgrades.volume,
      });
    }, 1000 * cooldown);
    this.setState({
      sellTime: cooldown,
    });
  }

  short(symbol, cooldown) {
    setTimeout(() => {
      this.props.socket.emit("short-asset", {
        symbol: symbol,
        shares: 10 ** this.props.upgrades.volume,
      });
    }, 1000 * cooldown);
    this.setState({
      sellTime: cooldown,
    });
  }

  hype(symbol, cooldown) {
    this.props.socket.emit("shill-asset", symbol);
    this.setState({
      hypeTime: cooldown,
    });
  }

  shortSellingUnlocked() {
    return this.props.powerups.indexOf("short-selling") > -1;
  }

  metricsUnlocked() {
    return this.props.powerups.indexOf("market-metrics") > -1;
  }

  componentDidUpdate(prevProps) {
    let cashDelta = this.props.cash - prevProps.cash;
    if (cashDelta) {
      this.animateCash(cashDelta)
    }
  }

  animateCash(cashDelta) {
    let deltaString = (cashDelta < 0 ? '' : '+') + cashDelta.toFixed(2);
    let positive = cashDelta >= 0;

    const b = document.createElement("b");
    b.innerText = deltaString;
    b.className = positive ? 'cashGainAnimation' : 'cashLossAnimation';

    b.onanimationend = () => document.getElementById("cashAnimation").removeChild(b);
    document.getElementById("cashAnimation").appendChild(b);
  }

  render() {
    let cooldowns = {
      buy: 6 / 2 ** this.props.upgrades.buy,
      sell: 6 / 2 ** this.props.upgrades.sell,
      hype: 40 / 2 ** this.props.upgrades.hype,
    };

    let margin = this.getMargin();

    let getTooltip = (asset) => {
      let metrics = this.state.marketMetrics.find(
        (m) => m.symbol === asset.symbol
      );
      let unlocked = metrics && this.metricsUnlocked();
      return (
        <React.Fragment>
          <div style={{ fontSize: "1.4em", minWidth: "200px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>{asset.name}</div>
              <div>(${asset.symbol})</div>
            </div>
            <br />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>Share price</div>
              <div>
                ${(this.props.currentPrices[asset.symbol] || 0).toFixed(2)}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>Dividend</div>
              <div>
                {unlocked ? (
                  "$" + metrics.dividendRate.toFixed(4)
                ) : (
                  <span style={{ color: "#bbbbbb" }}>
                    <i>unknown</i>
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>Hype factor</div>
              <div>
                {unlocked ? (
                  metrics.hype.toFixed(3)
                ) : (
                  <span style={{ color: "#bbbbbb" }}>
                    <i>unknown</i>
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>Short interest</div>
              <div>
                {unlocked ? (
                  Math.floor(metrics.shortInterest * 100) + "%"
                ) : (
                  <span style={{ color: "#bbbbbb" }}>
                    <i>unknown</i>
                  </span>
                )}
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    };

    const getQuantity = (symbol) => {
      return `${this.props.playerHoldings[symbol] < 0 ? "−" : ""}${Math.abs(this.props.playerHoldings[symbol]) || 0}`
    }

    const getTotal = (symbol) => {
      return `${this.props.playerHoldings[symbol] < 0 ? "−" : ""}\$${(
        (Math.abs(this.props.playerHoldings[symbol]) || 0) *
        this.props.currentPrices[symbol]
      ).toFixed(2)}`
    }

    return (
      <div style={{ userSelect: "none" }}>
        <table>
          <tbody>
            {this.props.assetDescriptions.map((asset) => (
              <tr key={asset.symbol + "-row"}>
                <td
                  style={{
                    color: asset.color,
                    minWidth: '100px'
                  }}
                >
                  <Tooltip title={getTooltip(asset)} placement="right">
                    <span>
                      <b>${asset.symbol}</b>{" "}
                    </span>
                  </Tooltip>
                </td>
                <td>
                  ${(this.props.currentPrices[asset.symbol] || 0).toFixed(2)}
                </td>
                <td>
                  x {getQuantity(asset.symbol)}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  = {getTotal(asset.symbol)}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {!this.props.playerHoldings[asset.symbol] ||
                  this.props.playerHoldings[asset.symbol] >= 0 ? (
                    <TransactionButton
                      label="Buy"
                      onClick={() => this.buy(asset.symbol, cooldowns.buy)}
                      time={this.state.buyTime}
                      cooldown={cooldowns.buy}
                      disabled={
                        this.props.cash <
                        parseFloat(this.props.currentPrices[asset.symbol])
                      }
                    />
                  ) : (
                    <TransactionButton
                      label="Close out"
                      onClick={() => this.closeOut(asset.symbol, cooldowns.buy)}
                      time={this.state.buyTime}
                      cooldown={cooldowns.buy}
                    />
                  )}
                </td>
                <td>
                  {this.props.playerHoldings[asset.symbol] > 0 ||
                  !this.shortSellingUnlocked() ? (
                    <TransactionButton
                      label="Sell"
                      onClick={() => this.sell(asset.symbol, cooldowns.sell)}
                      time={this.state.sellTime}
                      cooldown={cooldowns.sell}
                      disabled={!this.props.playerHoldings[asset.symbol] > 0}
                    />
                  ) : (
                    <TransactionButton
                      label="Short"
                      onClick={() => this.short(asset.symbol, cooldowns.sell)}
                      time={this.state.sellTime}
                      cooldown={cooldowns.sell}
                    />
                  )}
                </td>
                <td>
                  <TransactionButton
                    label="Hype"
                    onClick={() => this.hype(asset.symbol, cooldowns.hype)}
                    time={this.state.hypeTime}
                    cooldown={cooldowns.hype}
                  />
                </td>
              </tr>
            ))}
            <tr key={"cash-row"}>
              <td>
                <b>Cash</b>
              </td>
              <td>
                <span>{`\$${this.props.cash}`}</span>
                &nbsp;
                <span id="cashAnimation" style={{position: 'absolute'}} />
              </td>
            </tr>
            <tr key={"dividend-row"}>
              <td>
                <Tooltip
                  title={
                    <div style={{ fontSize: "1.4em", minWidth: "200px" }}>
                      Companies periodically pay dividends to their shareholders
                      based on how successful the business is. In the last
                      dividend period, you received{" "}
                      {`\$${this.state.lastDividend}`}.
                    </div>
                  }
                  placement="right"
                >
                  <div style={{ position: "relative", marginTop: "5px" }}>
                    <b>Dividend</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <div
                      style={{ position: "absolute", top: "2px", left: "72px" }}
                    >
                      <CooldownTimer
                        current={this.state.timeToNextDividend}
                        max={60}
                      />
                    </div>
                  </div>
                </Tooltip>
              </td>
              <td>{`\$${this.state.lastDividend}`}</td>
            </tr>
            {this.shortSellingUnlocked() ? (
              <tr key={"margin-row"}>
                <td>
                  {" "}
                  <Tooltip
                    title={
                      <div style={{ fontSize: "1.4em", minWidth: "200px" }}>
                        If the value of your shares and cash relative to the
                        value of shares you have borrowed is below 200% when
                        margin call happens, your broker may use your shares and
                        cash to close out all or part of your short position.
                      </div>
                    }
                    placement="right"
                  >
                    <div style={{ position: "relative",  marginTop: "5px" }}>
                      <b>Margin</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <div
                        style={{
                          position: "absolute",
                          top: "2px",
                          left: "72px",
                        }}
                      >
                        <CooldownTimer
                          current={this.state.timeToNextMarginCheck}
                          max={20}
                        />
                      </div>
                    </div>
                  </Tooltip>
                </td>
                <td
                  style={{
                    color: this.getMargin()
                      ? this.isMarginSafe()
                        ? "green"
                        : "red"
                      : "black",
                  }}
                >{`${
                  margin ? `${margin > 1000 ? ">1000" : margin}%` : "-"
                }`}</td>
              </tr>
            ) : (
              <tr style={{ height: "12px" }}></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default TransactionPanel;
