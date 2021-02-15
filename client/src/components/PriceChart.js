import React, { Component } from "react";
import c3 from "c3";
import "c3/c3.css";

class PriceChart extends Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    let symbols = Object.keys(nextProps.securities);
    let data = symbols.map(symbol => [symbol, ...nextProps.securities[symbol]]);
    c3.generate({
      bindto: "#chart",
      data: {
        columns: data,
        type: "line",
      },
      transition: {
        duration: null,
      },
    });
    return false;
  }

  render() {
    return <div id="chart" />;
  }
}

export default PriceChart;
