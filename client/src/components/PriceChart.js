import React, { Component } from "react";
import c3 from "c3";
import "c3/c3.css";
import { ASSET_COLORS } from "../constants";

class PriceChart extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let symbols = Object.keys(this.props.symbols);

    let colors = {};
    for (let i = 0; i < symbols.length; i++) {
      colors[symbols[i]] = ASSET_COLORS[i];
      console.log(colors);
    }
    this.chart = c3.generate({
      bindto: "#chart",
      data: {
        columns: symbols.map(s => [s]),
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
          max: 100,
          min: 0,
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
    return false;
  }

  render() {
    return <div id="chart" />;
  }
}

export default PriceChart;
