import React, { Component } from "react";
import c3 from "c3";
import "c3/c3.css";
import { ASSET_COLORS } from "../constants";

class PriceChart extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let symbols = Object.keys(this.props.securities);

    let colors = {};
    console.log("symbols");
    console.log(symbols);
    for (let i = 0; i < symbols.length; i++) {
      colors[symbols[i]] = ASSET_COLORS[i];
      console.log(colors);
    }
    console.log(colors);
    let data = symbols.map((symbol) => [
      symbol,
      ...this.props.securities[symbol],
    ]);
    console.log(ASSET_COLORS);
    this.chart = c3.generate({
      bindto: "#chart",
      data: {
        columns: data,
        type: "line",
        colors: colors,
      },
      transition: {
        duration: null,
      },
      size: {
        height: 280,
        width: 950
      },
      legend: {
        hide: true,
      },
      axis: {
        x: {
          tick: {
            values: [],
          },
        },
        y: {
          tick: {
            format: (y) => (y >= 0 ? `\$${y}` : ""),
          },
        },
      },
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    let symbols = Object.keys(nextProps.securities);
    let data = symbols.map((symbol) => [
      symbol,
      ...nextProps.securities[symbol],
    ]);
    this.chart.load({
      columns: data,
    });
    return false;
  }

  render() {
    return <div id="chart" />;
  }
}

export default PriceChart;
