import React, { Component } from "react";
import c3 from "c3";
import "c3/c3.css";

class PriceChart extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let colors = {};
    for (let i = 0; i < this.props.assetDescriptions.length; i++) {
      colors[this.props.assetDescriptions[i].symbol] = this.props.assetDescriptions[i].color;
    }
    this.chart = c3.generate({
      bindto: "#chart",
      data: {
        columns: this.props.assetDescriptions.map(a => [a.symbol]),
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
