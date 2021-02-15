import React, { Component } from "react";
import Ticker from "react-ticker";
import _ from "lodash";

const NEWS_PRUNE_COUNT = 4;

class NewsTicker extends Component {
  constructor(props) {
    super(props);

    this.state= {
      news: [{ text: "Florida man wins lottery after receiving vaccine" },
      {
        text:
          "New study links black-rinded futsu squash to lower rates of Groat's disease",
      },]
    }

    this.props.socket.on("news", (news) => {
      if (!window.focused) return;
      let updatedNews = _.cloneDeep(this.state.news);
      updatedNews.push(news);
      if (updatedNews.length > NEWS_PRUNE_COUNT) {
        updatedNews.shift();
      }
      this.setState({ news: updatedNews });
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
              {this.state.news[index % this.state.news.length].text}
              &nbsp;•&nbsp;
            </b>
          </span>
        )}
      </Ticker>
    );
  }
}

export default NewsTicker;
