import React from "react";
import c3 from "c3";
import "c3/c3.css";

export const PriceChart = () => {
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      console.log("helllo1");
      let priceHistory = window.securities;
      let newData = [];
      for (let symbol in priceHistory) {
        newData.push([symbol, ...priceHistory[symbol]]);
      }
      setData(newData);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    console.log("helloeee");
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
  }, [data]);

  return <div id="chart" />;
};

export default PriceChart;
