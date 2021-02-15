import React, { Component } from "react";
import _ from "lodash";
import PriceChart from "./PriceChart";
import Button from "@material-ui/core/Button";

class BuyButton extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Button
        color="primary"
        onClick={() => this.props.socket.emit("buy-asset", this.props.symbol)}
      >
        Buy
      </Button>
    );
  }
}

class SellButton extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Button
        color="primary"
        onClick={() => this.props.socket.emit("sell-asset", this.props.symbol)}
      >
        Sell
      </Button>
    );
  }
}

class ShillButton extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Button
        color="primary"
        onClick={() => this.props.socket.emit("shill-asset", this.props.symbol)}
      >
        Shill
      </Button>
    );
  }
}

class SecuritiesDashboard extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div><b>USD:</b> {this.props.cash}</div>
        {Object.keys(this.props.securities).map((symbol) => (
          <div>
            <b>${symbol}:</b> {(this.props.playerHoldings[symbol] || 0).toFixed(2)} @ {_.last(this.props.securities[symbol]).toFixed(2)}{" "}
            <BuyButton socket={this.props.socket} symbol={symbol} /> |{" "}
            <SellButton socket={this.props.socket} symbol={symbol} /> |{" "}
            <ShillButton socket={this.props.socket} symbol={symbol} />
          </div>
        ))}
        <PriceChart />
      </div>
    );
  }
}

export default SecuritiesDashboard;
