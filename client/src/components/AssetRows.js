import React, { Component } from "react";
import { isDesktop } from "../utils";
import { Button } from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import CooldownTimer from "./CooldownTimer.js";

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

class AssetRows extends Component {
  constructor(props) {
    super(props);
    this.state = { buyTime: 0, sellTime: 0, hypeTime: 0 };
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({
        buyTime: Math.max(0, this.state.buyTime - 0.1),
        sellTime: Math.max(0, this.state.sellTime - 0.1),
        hypeTime: Math.max(0, this.state.hypeTime - 0.1),
      });
    }, 100);
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

  render() {
    let cooldowns = {
      buy: 6 / 2 ** this.props.upgrades.buy,
      sell: 6 / 2 ** this.props.upgrades.sell,
      hype: 40 / 2 ** this.props.upgrades.hype,
    };
    if (this.props.upgrades.buy >= 4) {
      cooldowns.buy = 0;
    }
    if (this.props.upgrades.sell >= 4) {
      cooldowns.sell = 0;
    }

    let getTooltip = (asset) => {
      let metrics = this.props.marketMetrics.find(
        (m) => m.symbol === asset.symbol
      );
      let unlocked = metrics && this.props.metricsUnlocked;
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
      return `${this.props.playerHoldings[symbol] < 0 ? "−" : ""}${
        Math.abs(this.props.playerHoldings[symbol]) || 0
      }`;
    };

    const getTotal = (symbol) => {
      return `${this.props.playerHoldings[symbol] < 0 ? "−" : ""}\$${(
        (Math.abs(this.props.playerHoldings[symbol]) || 0) *
        this.props.currentPrices[symbol]
      ).toFixed(2)}`;
    };
    if (isDesktop()) {
      return (
        <table>
          <tbody>
            {this.props.assetDescriptions.map((asset) => (
              <tr key={asset.symbol + "-row"}>
                <td
                  style={{
                    color: asset.color,
                    minWidth: "100px",
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
                <td>× {getQuantity(asset.symbol)}</td>
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
                  !this.props.shortSellingUnlocked ? (
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
          </tbody>
        </table>
      );
    } else {
      return (
        <table>
          {this.props.assetDescriptions.map((asset) => (
            <tbody>
              <tr key={asset.symbol + "-row"}>
                <td
                  style={{
                    color: asset.color,
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
                <td>× {getQuantity(asset.symbol)}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  = {getTotal(asset.symbol)}
                </td>
              </tr>
              <tr key={asset.symbol + "-transaction-row"}>
                <td style={{ whiteSpace: "nowrap", paddingBottom: "8px" }}>
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
                <td style={{ paddingBottom: "8px" }}>
                  {this.props.playerHoldings[asset.symbol] > 0 ||
                  !this.props.shortSellingUnlocked ? (
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
                <td style={{ paddingBottom: "8px" }}>
                  <TransactionButton
                    label="Hype"
                    onClick={() => this.hype(asset.symbol, cooldowns.hype)}
                    time={this.state.hypeTime}
                    cooldown={cooldowns.hype}
                  />
                </td>
              </tr>
            </tbody>
          ))}
        </table>
      );
    }
  }
}

export default AssetRows;
