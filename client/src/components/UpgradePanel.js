import React, { Component } from "react";
import _ from "lodash";
import { CircularProgress, Typography, Button, Box } from "@material-ui/core";

const upgradeCosts = {
  buy: [150, 500, 1000],
  sell: [150, 500, 1000],
  hype: [150, 500, 1000],
  volume: [1000, 2000],
};

class UpgradePanel extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let buyCost = upgradeCosts["buy"][this.props.upgrades.buy];
    let sellCost = upgradeCosts["sell"][this.props.upgrades.sell];
    let hypeCost = upgradeCosts["hype"][this.props.upgrades.hype];
    let volumeCost = upgradeCosts["volume"][this.props.upgrades.volume];

    return (
      <div>
        <table>
          <tbody>
            <tr key={"header"}>
              <td>
                <b>System</b>
              </td>
              <td>
                <b>Effect</b>
              </td>
            </tr>
            <tr>
              <td>HFT Server (Lvl {this.props.upgrades.buy})</td>
              <td>2x Buy speed</td>
              <td>
                <Button
                  size="small"
                  color="primary"
                  disabled={
                    this.props.upgrades.buy >= upgradeCosts["buy"].length ||
                    this.props.cash <= buyCost
                  }
                  onClick={() => this.props.socket.emit("buy-upgrade", "buy")}
                >
                  Upgrade ${buyCost}
                </Button>
              </td>
            </tr>
            <tr>
              <td>Fat Pipes (Lvl {this.props.upgrades.sell})</td>
              <td>2x Sell speed</td>
              <td>
                <Button
                  size="small"
                  color="primary"
                  disabled={
                    this.props.upgrades.sell >= upgradeCosts["sell"].length ||
                    this.props.cash <= sellCost
                  }
                  onClick={() => this.props.socket.emit("buy-upgrade", "sell")}
                >
                  Upgrade ${sellCost}
                </Button>
              </td>
            </tr>
            <tr>
              <td>Distributed Botnet (Lvl {this.props.upgrades.hype})</td>
              <td>2x Hype speed</td>
              <td>
                <Button
                  size="small"
                  color="primary"
                  disabled={
                    this.props.upgrades.hype >= upgradeCosts["hype"].length ||
                    this.props.cash <= hypeCost
                  }
                  onClick={() => this.props.socket.emit("buy-upgrade", "hype")}
                >
                  Upgrade ${hypeCost}
                </Button>
              </td>
            </tr>
            <tr>
              <td>Brokerage Backchannel (Lvl {this.props.upgrades.volume})</td>
              <td>+5 trade volume</td>
              <td>
                <Button
                  size="small"
                  color="primary"
                  disabled={
                    this.props.upgrades.volume >=
                      upgradeCosts["volume"].length ||
                    this.props.cash <= volumeCost
                  }
                  onClick={() =>
                    this.props.socket.emit("buy-upgrade", "volume")
                  }
                >
                  Upgrade ${volumeCost}
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default UpgradePanel;
