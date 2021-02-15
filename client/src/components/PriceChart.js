import React, { Component } from "react";
import c3 from "c3";
import "c3/c3.css";

class PriceChart extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let symbols = Object.keys(this.props.securities);
    let data = symbols.map(symbol => [symbol, ...this.props.securities[symbol]]);
    this.chart = c3.generate({
      bindto: "#chart",
      data: {
        columns: data,
        type: "line",
      },
      transition: {
        duration: null,
      },
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    let symbols = Object.keys(nextProps.securities);
    let data = symbols.map(symbol => [symbol, ...nextProps.securities[symbol]]);
    this.chart.load({
      columns: data
    });
    return false;
  }

  render() {
    return <div id="chart" />;
  }
}

export default PriceChart;
