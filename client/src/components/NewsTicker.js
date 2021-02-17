import React, { Component } from "react";
import Ticker from "react-ticker";
import _ from "lodash";

const NEWS_PRUNE_COUNT = 4;

class NewsTicker extends Component {
  constructor(props) {
    super(props);

    this.news = [
      { text: "Florida man wins lottery after receiving vaccine" },
      {
        text:
          "New study links black-rinded futsu squash to lower rates of Groat's disease",
      }
    ]

    this.props.socket.on("news", (news) => {
      if (!window.focused) return;
      this.news.push(news);
      if (this.news.length > NEWS_PRUNE_COUNT) {
        this.news.shift();
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  render() {
    return (
      <Ticker>
        {({ index }) => (
          <span>
            <b>
              {this.news[index % this.news.length].text}
              &nbsp;•&nbsp;
            </b>
          </span>
        )}
      </Ticker>
    );
  }
}

export default NewsTicker;
