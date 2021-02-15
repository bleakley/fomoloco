import React, { Component } from "react";
import _ from "lodash";
import PriceChart from "./PriceChart";
import TransactionPanel from "./TransactionPanel";

class SecuritiesDashboard extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <TransactionPanel cash={this.props.cash} securities={this.props.securities} cooldowns={this.props.cooldowns} socket={this.props.socket} playerHoldings={this.props.playerHoldings} />
        <PriceChart securities={this.props.securities} />
      </div>
    );
  }
}

export default SecuritiesDashboard;
