import { Card } from "@material-ui/core";
import EventEmitter from "events";
import _ from "lodash";
import React, { Component } from "react";
import "../App.css";
import Leaderboard from "./Leaderboard";
import NewsTicker from "./NewsTicker";
import HypeFeed from "./HypeFeed";
import SecuritiesDashboard from "./SecuritiesDashboard";
import openConnection from "socket.io-client";

const HYPE_MESSAGE_PRUNE_COUNT = 20;
const PRICE_HISTORY_PRUNE_COUNT = 500;
const NEWS_PRUNE_COUNT = 4;

let socket = openConnection("http://localhost:8080", {
  query: "username=dfv",
});

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      leaderboard: [],
      leaderboardLastUpdated: Date.now(),
      news: [
        { text: "Florida man wins lottery" },
        {
          text:
            "New study links futsu black-rinded squash to lower rates of Groat's disease",
        },
      ],
      hype: [],
      securities: {},
      cash: 0,
      playerHoldings: {},
    };

    this.socket = socket;

    socket.on("leaderboard", (leaderboard) => {
      this.setState({
        leaderboard: leaderboard,
        leaderboardLastUpdated: Date.now(),
      });
    });

    socket.on("hype-message", (message) => {
      if (this.state.hype.length > 2 * HYPE_MESSAGE_PRUNE_COUNT) {
        this.setState({
          hype: [
            ...this.state.hype.slice(
              HYPE_MESSAGE_PRUNE_COUNT,
              this.state.hype.length
            ),
            message,
          ],
        });
      } else {
        this.setState({ hype: [...this.state.hype, message] });
      }
    });

    socket.on("prices", (message) => {
      let updatedPriceHistories = _.cloneDeep(this.state.securities);
      for (let i = 0; i < message.length; i++) {
        let security = message[i];
        if (updatedPriceHistories[security.symbol] == null) {
          updatedPriceHistories[security.symbol] = [];
        }
        if (
          updatedPriceHistories[security.symbol].length >
          2 * PRICE_HISTORY_PRUNE_COUNT
        ) {
          updatedPriceHistories[security.symbol] = [
            ...updatedPriceHistories[security.symbol].slice(
              PRICE_HISTORY_PRUNE_COUNT,
              updatedPriceHistories[security.symbol].length
            ),
            security.price,
          ];
        } else {
          updatedPriceHistories[security.symbol] = [
            ...updatedPriceHistories[security.symbol],
            security.price,
          ];
        }
      }
      this.setState({ securities: updatedPriceHistories });
    });

    socket.on("news", (news) => {
      let updatedNews = _.cloneDeep(this.state.news);
      updatedNews.unshift(news);
      if (updatedNews.length > NEWS_PRUNE_COUNT) {
        updatedNews.pop();
      }
      this.setState({ news: updatedNews });
    });

    socket.on("transaction", (transaction) => {
      this.setState({ cash: transaction.newCash });
      if (!this.state.playerHoldings.hasOwnProperty(transaction.symbol)) {
        this.setState({
          playerHoldings: {
            ...this.state.playerHoldings,
            [transaction.symbol]: transaction.newShares,
          },
        });
      }
    });
  }

  render() {
    return (
      <div className="Main">
        <Card className="CashLeaderboard">
          <Leaderboard
            highScores={this.state.leaderboard}
            leaderboardLastUpdated={this.state.leaderboardLastUpdated}
          />
        </Card>
        <Card className="Advertisement">Super annoying ad</Card>
        <Card className="HypeFeed">
          <HypeFeed hype={this.state.hype} />
        </Card>
        <Card className="SecuritiesDashboard">
          <SecuritiesDashboard
            cash={this.state.cash}
            playerHoldings={this.state.playerHoldings}
            securities={this.state.securities}
            socket={this.socket}
          />
        </Card>
        <Card className="NewsTicker">
          <NewsTicker news={this.state.news} />
        </Card>
      </div>
    );
  }
}

export default Main;
