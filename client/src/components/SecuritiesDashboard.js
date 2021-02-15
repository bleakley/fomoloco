import React, { Component } from "react";
import _ from "lodash";
import PriceChart from "./PriceChart";

class SecuritiesDashboard extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        {Object.keys(this.props.securities).map((symbol) => (
          <div>
            <b>${symbol}:</b> {_.last(this.props.securities[symbol])} Buy | Sell
            | Shill
          </div>
        ))}
        <PriceChart />
      </div>
    );
  }
}

export default SecuritiesDashboard;
