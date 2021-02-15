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

let socket = openConnection("http://localhost:8080", { query: "username=dfv" });

const HYPE_MESSAGE_PRUNE_COUNT = 20;
const PRICE_HISTORY_PRUNE_COUNT = 500;

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      leaderboard: [
        { name: "CryptoFOMO", netWorth: 253490, cash: 253490, profit: 253490 },
        {
          name: "u/deepfuckingvalue",
          netWorth: 963495,
          cash: 963495,
          profit: 963495,
        },
      ],
      news: [
        { text: "BREAKING NEWS" },
        { text: "$GMME announces cloud-first quantum mainnet for Q3" },
        { text: "8 killed and 35 wounded in $YOLO-inspired massacre" },
        { text: "Hackers from 5chan exploit $BITZ zero day vulnerability" },
        { text: "Analysts say $HYPE trading 3 times above target" },
      ],
      hype: [],
      securities: {},
    };

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
      window.securities = updatedPriceHistories;
    });
  }

  render() {
    return (
      <div className="Main">
        <Card className="CashLeaderboard">
          <Leaderboard highScores={this.state.leaderboard} />
        </Card>
        <Card className="Advertisement">Super annoying ad</Card>
        <Card className="HypeFeed">
          <HypeFeed hype={this.state.hype} />
        </Card>
        <Card className="SecuritiesDashboard">
          <SecuritiesDashboard securities={this.state.securities} />
        </Card>
        <Card className="NewsTicker">
          <NewsTicker news={this.state.news} />
        </Card>
      </div>
    );
  }
}

export default Main;
