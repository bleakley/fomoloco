import React, { Component } from "react";
import _ from "lodash";
import PriceChart from "./PriceChart";
import TransactionPanel from "./TransactionPanel";
import UpgradePanel from "./UpgradePanel";

const PRICE_HISTORY_PRUNE_COUNT = 100;

const getDefaultState = () => ({
  securities: {},
  cash: 0,
  playerHoldings: {},
  upgrades: {
    buy: 0,
    sell: 0,
    hype: 0,
    volume: 0,
  },
});

class SecuritiesDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = getDefaultState();

    this.props.socket.on("transaction", (transaction) => {
      if (!window.focused) return;
      this.setState({ cash: transaction.newCash });
      if (!this.state.playerHoldings.hasOwnProperty(transaction.symbol)) {
        this.setState({
          playerHoldings: {
            ...this.state.playerHoldings,
            [transaction.symbol]: transaction.newShares,
          },
        });
      } else {
        let newPlayerHoldings = _.cloneDeep(this.state.playerHoldings);
        newPlayerHoldings[transaction.symbol] = transaction.newShares;
        this.setState({ playerHoldings: newPlayerHoldings });
      }
    });

    this.props.socket.on("prices", (message) => {
      if (!window.focused) return;
      let updatedPriceHistories = _.cloneDeep(this.state.securities);
      for (let i = 0; i < message.length; i++) {
        let security = message[i];
        if (updatedPriceHistories[security.symbol] == null) {
          updatedPriceHistories[security.symbol] = [];
        }
        updatedPriceHistories[security.symbol] = updatedPriceHistories[
          security.symbol
        ].concat([security.price]);
        if (
          updatedPriceHistories[security.symbol].length >
          PRICE_HISTORY_PRUNE_COUNT
        ) {
          updatedPriceHistories[security.symbol].shift();
        }
      }
      this.setState({ securities: updatedPriceHistories });
    });

    this.props.socket.on("upgrade", (message) => {
      this.setState({
        cash: message.cash,
        upgrades: { ...this.state.upgrades, [message.type]: message.level },
      });
    });
  }

  render() {
    return (
      <div style={{ display: "flex", gap: "20px", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <TransactionPanel
            cash={this.state.cash}
            securities={this.state.securities}
            upgrades={this.state.upgrades}
            socket={this.props.socket}
            playerHoldings={this.state.playerHoldings}
          />
          <UpgradePanel
            cash={this.state.cash}
            upgrades={this.state.upgrades}
            socket={this.props.socket}
          />
        </div>
        <PriceChart
          securities={this.state.securities}
          key={Object.keys(this.state.securities).length}
        />
      </div>
    );
  }
}

export default SecuritiesDashboard;
