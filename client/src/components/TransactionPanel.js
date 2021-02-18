import React, { Component } from "react";
import _ from "lodash";
import { CircularProgress, Typography, Button, Box } from "@material-ui/core";

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
          {props.current}
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
        disabled={Boolean(this.props.time)}
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
    };

    setInterval(() => {
      this.setState({
        buyTime: Math.max(0, this.state.buyTime - 1),
        sellTime: Math.max(0, this.state.sellTime - 1),
        hypeTime: Math.max(0, this.state.hypeTime - 1),
      });
    }, 1000);
  }

  buy(symbol, cooldown) {
    this.props.socket.emit("buy-asset", { symbol: symbol, shares: 1 });
    this.setState({
      buyTime: cooldown,
    });
  }

  sell(symbol, cooldown) {
    this.props.socket.emit("sell-asset", { symbol: symbol, shares: 1 });
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
      buy: 5 - this.props.upgrades.buy,
      sell: 5 - this.props.upgrades.sell,
      hype: 20 - 2 * this.props.upgrades.hype,
    };

    return (
      <div>
        <table>
          <tbody>
            <tr key={"header"}>
              <td></td>
              <td>
                <b>Quantity</b>
              </td>
              <td>
                <b>Price</b>
              </td>
              <td>
                <b>Value</b>
              </td>
            </tr>
            {this.props.assetDescriptions.map((asset) => (
              <tr key={asset.symbol + "-row"}>
                <td
                  style={{
                    color: asset.color
                  }}
                >
                  <b>${asset.symbol}</b>{" "}
                </td>
                <td>{this.props.playerHoldings[asset.symbol] || 0} </td>
                <td>${this.props.currentPrices[asset.symbol]} </td>
                <td>
                  $
                  {(
                    (this.props.playerHoldings[asset.symbol] || 0) *
                    this.props.currentPrices[asset.symbol]
                  ).toFixed(2)}{" "}
                </td>
                <td>
                  <TransactionButton
                    label="Buy"
                    onClick={() => this.buy(asset.symbol, cooldowns.buy)}
                    time={this.state.buyTime}
                    cooldown={cooldowns.buy}
                  />
                </td>
                <td>
                  <TransactionButton
                    label="Sell"
                    onClick={() => this.sell(asset.symbol, cooldowns.sell)}
                    time={this.state.sellTime}
                    cooldown={cooldowns.sell}
                  />
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
              <td>{`\$${this.props.cash}`}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default TransactionPanel;
