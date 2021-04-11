import React, { Component } from "react";
import _ from "lodash";
import { Button } from "@material-ui/core";
import recordEvent from "../utils.js";
const upgrades = {
  buy: {
    class: "Connection",
    levels: [
      { cost: 0, name: "28.8 kbps modem", description: "1x buy speed" },
      { cost: 40, name: "DSL", description: "2x buy speed" },
      { cost: 160, name: "gigabit fiber", description: "4x buy speed" },
      {
        cost: 600,
        name: "co-located HFT server",
        description: "8x buy speed",
      },
    ],
  },
  sell: {
    class: "Hardware",
    levels: [
      { cost: 0, name: "dirty keyboard", description: "1x sell/short speed" },
      { cost: 40, name: "clean keyboard", description: "2x sell/short speed" },
      {
        cost: 160,
        name: "gaming keyboard",
        description: "4x sell/short speed",
      },
      {
        cost: 600,
        name: "gaming keyboard w/ LEDs",
        description: "8x sell/short speed",
      },
    ],
  },
  hype: {
    class: "Influence",
    levels: [
      { cost: 0, name: "basic account", description: "1x hype speed" },
      { cost: 40, name: "high karma account", description: "2x hype speed" },
      { cost: 160, name: "moderator account", description: "4x hype speed" },
      { cost: 600, name: "distributed botnet", description: "8x hype speed" },
    ],
  },
  volume: {
    class: "Platform",
    levels: [
      { cost: 0, name: "Nottingham app", description: "1x volume" },
      { cost: 500, name: "brokerage account", description: "10x volume" },
      {
        cost: 2000,
        name: "brokerage backchannel",
        description: "100x volume",
      },
    ],
  },
};

class Upgrade extends Component {
  constructor(props) {
    super(props);
  }

  buy() {
    this.props.socket.emit("buy-upgrade", this.props.type);
    recordEvent("buy_upgrade", { type: this.props.type });
  }

  render() {
    let currentLevel =
      upgrades[this.props.type].levels[this.props.upgrades[this.props.type]];
    let nextLevel =
      this.props.upgrades[this.props.type] + 1 <
      upgrades[this.props.type].levels.length
        ? upgrades[this.props.type].levels[
            this.props.upgrades[this.props.type] + 1
          ]
        : null;
    return (
      <tr>
        <td style={{ minWidth: "300px", whiteSpace: "nowrap" }}>
          {currentLevel.name}{" "}
          {currentLevel.description ? `(${currentLevel.description})` : ""}
        </td>
        <td style={{ minWidth: "100px", whiteSpace: "nowrap" }}>
          {nextLevel ? (
            <Button
              size="small"
              color="primary"
              disabled={this.props.cash <= nextLevel.cost}
              onClick={() => this.buy()}
            >
              Upgrade {upgrades[this.props.type].class} ${nextLevel.cost}
            </Button>
          ) : (
            ""
          )}
        </td>
      </tr>
    );
  }
}

class UpgradePanel extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <table>
          <tbody>
            {Object.keys(upgrades).map((type, i) => (
              <Upgrade
                key={i}
                type={type}
                cash={this.props.cash}
                upgrades={this.props.upgrades}
                socket={this.props.socket}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default UpgradePanel;
