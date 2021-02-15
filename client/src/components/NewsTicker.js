import { ThemeProvider } from "@material-ui/core";
import React, { Component } from "react";
import Ticker from "react-ticker";

class Leaderboard extends Component {
  constructor(props) {
    super(props);
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
              {this.props.news[index % this.props.news.length].text}
              &nbsp;•&nbsp;
            </b>
          </span>
        )}
      </Ticker>
    );
  }
}

export default Leaderboard;
