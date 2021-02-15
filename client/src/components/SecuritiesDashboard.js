import React, { Component } from "react";
import _ from "lodash";
import PriceChart from "./PriceChart";
import TransactionPanel from "./TransactionPanel";

const PRICE_HISTORY_PRUNE_COUNT = 100;

const getDefaultState = () => ({
  securities: {},
  cash: 0,
  playerHoldings: {},
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
        updatedPriceHistories[security.symbol] = updatedPriceHistories[security.symbol].concat([security.price]);
        if (updatedPriceHistories[security.symbol].length > PRICE_HISTORY_PRUNE_COUNT) {
          updatedPriceHistories[security.symbol].shift();
        }
      }
      this.setState({ securities: updatedPriceHistories });
    });
  }

  render() {
    return (
      <div>
        <TransactionPanel cash={this.state.cash} securities={this.state.securities} cooldowns={this.props.cooldowns} socket={this.props.socket} playerHoldings={this.state.playerHoldings} />
        <PriceChart securities={this.state.securities} />
      </div>
    );
  }
}

export default SecuritiesDashboard;
