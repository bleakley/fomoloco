import React, { Component } from "react";
import _ from "lodash";
import LinkedList from "linked-list";
import PriceChart from "./PriceChart";
import TransactionPanel from "./TransactionPanel";
import UpgradePanel from "./UpgradePanel";

const PRICE_HISTORY_PRUNE_COUNT = 100;

let priceHistories = {};

const getDefaultState = () => ({
  currentPrices: {},
  cash: 0,
  lastDividend: 0,
  timeToNextDividend: 60,
  playerHoldings: {},
  upgrades: {
    buy: 0,
    sell: 0,
    hype: 0,
    volume: 0,
  },
});

class PricePoint extends LinkedList.Item {
  constructor(value) {
    super();
    this.value = value;
  }
}

class PriceHistory extends LinkedList {
  constructor(symbol) {
    super();
    this.symbol = symbol;
  }

  toDataColumn() {
    var item = this.head;
    var result = [this.symbol];
  
    while (item) {
      result.push(item.value);
      item = item.next;
    }
  
    return result;
  }
}

class SecuritiesDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = getDefaultState();

    this.chartComponent = React.createRef();
  }

  componentDidMount() {
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

    this.props.socket.on("dividend", (transaction) => {
      this.setState({ 
        cash: transaction.newCash,
        lastDividend: transaction.totalPayout,
        timeToNextDividend: transaction.timeToNextDividend,
       });
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
        if (!priceHistories[security.symbol]) {
          priceHistories[security.symbol] = new PriceHistory(security.symbol);
        }
        priceHistories[security.symbol].append(new PricePoint(Number(security.price)));
        if (
          priceHistories[security.symbol].size >
          PRICE_HISTORY_PRUNE_COUNT
        ) {
          priceHistories[security.symbol].head.detach();
        }
      }
      let comp = this.chartComponent.current;
        if (comp && comp.chart) {
          let data = Object.values(priceHistories).map(list => list.toDataColumn());
          let colors = {};
          for (let i = 0; i < this.props.assetDescriptions.length; i++) {
            colors[this.props.assetDescriptions[i].symbol] = this.props.assetDescriptions[i].color;
          }
          comp.chart.load({columns: data, colors: colors});
        }
    });

    this.props.socket.on("upgrade", (message) => {
      this.setState({
        cash: message.cash,
        upgrades: { ...this.state.upgrades, [message.type]: message.level },
      });
    });

    setInterval(() => {
      this.setState({
        timeToNextDividend: Math.max(0, this.state.timeToNextDividend - 1)
      });
    }, 1000);
  }

  render() {
    return (
      <div style={{ display: "flex", gap: "20px", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <TransactionPanel
            cash={this.state.cash}
            lastDividend={this.state.lastDividend}
            timeToNextDividend={this.state.timeToNextDividend}
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
