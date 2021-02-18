import React, { Component } from "react";
import _ from "lodash";
import PriceChart from "./PriceChart";
import TransactionPanel from "./TransactionPanel";
import UpgradePanel from "./UpgradePanel";

const PRICE_HISTORY_PRUNE_COUNT = 100;

const getDefaultState = () => ({
  currentPrices: {},
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

    this.priceHistories = {};
    this.chartComponent = React.createRef();

    this.props.socket.on("transaction", (transaction) => {
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
      let currentPrices = {};
      for (let i = 0; i < message.length; i++) {
        let security = message[i];
        currentPrices[security.symbol] = Number(security.price);
      }
      this.setState({ currentPrices });

      for (let i = 0; i < message.length; i++) {
        let security = message[i];
        if (this.priceHistories[security.symbol] == null) {
          this.priceHistories[security.symbol] = [];
        }
        this.priceHistories[security.symbol] = this.priceHistories[security.symbol].concat([Number(security.price)]);
        if (
          this.priceHistories[security.symbol].length >
          PRICE_HISTORY_PRUNE_COUNT
        ) {
          this.priceHistories[security.symbol].shift();
        }
      }
      let comp = this.chartComponent.current;
        if (comp && comp.chart) {
          let data = Object.keys(this.priceHistories).map(symbol => [symbol, ...this.priceHistories[symbol]]);
          comp.chart.load({columns: data});
          comp.chart.legend.hide();
        }
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
            currentPrices={this.state.currentPrices}
            upgrades={this.state.upgrades}
            socket={this.props.socket}
            playerHoldings={this.state.playerHoldings}
            assetDescriptions={this.props.assetDescriptions}
          />
          <UpgradePanel
            cash={this.state.cash}
            upgrades={this.state.upgrades}
            socket={this.props.socket}
          />
        </div>
        <PriceChart
          assetDescriptions={this.props.assetDescriptions}
          ref={this.chartComponent}
        />
      </div>
    );
  }
}

export default SecuritiesDashboard;
