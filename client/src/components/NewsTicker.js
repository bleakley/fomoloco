import React, { Component } from "react";
import { getAssetColor } from "../utils";
import Ticker from "react-ticker";
import _ from "lodash";

const NEWS_PRUNE_COUNT = 4;

class NewsTicker extends Component {
  constructor(props) {
    super(props);

    this.symbols = [];

    this.news = _.shuffle([
      { text: "Florida man wins lottery after receiving COVID-19 vaccine" },
      {
        text:
          "New study links black-rinded futsu squash to lower rates of Groat's disease",
      },
      {
        text:
          "Colorado man dies in car crash after receiving COVID-19 vaccine",
      },
      {
        text:
          "Mercury in retrograde causes loss of NASA spacecraft during attempted landing on the inner planet",
      }
    ]);

    this.props.socket.on("news", (news) => {
      if (!window.focused) return;
      this.news.push(news);
      if (this.news.length > NEWS_PRUNE_COUNT) {
        this.news.shift();
      }
    });

    this.props.socket.on("prices", (prices) => {
      this.symbols = prices.map((asset) => asset.symbol);
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  changeSymbolColors(text) {
    let updatedText = text;
    this.symbols.forEach(symbol => {
      updatedText = updatedText.replace('$' + symbol, `<span style="color: ${getAssetColor(symbol, this.symbols)}">\$${symbol}</span>`)
    });
    return updatedText;
  }

  render() {
    return (
      <Ticker>
        {({ index }) => (
          <span>
            <b>
              <span dangerouslySetInnerHTML={{__html: this.changeSymbolColors(this.news[index % this.news.length].text)}} />
              &nbsp;•&nbsp;
            </b>
          </span>
        )}
      </Ticker>
    );
  }
}

export default NewsTicker;
