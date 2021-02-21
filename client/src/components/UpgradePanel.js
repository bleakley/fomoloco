import React, { Component } from "react";
import _ from "lodash";
import { Button } from "@material-ui/core";

const upgrades = {
  buy: {
    class: "Connection",
    levels: [
      { cost: 0, name: "28.8 kbps modem", description: "1x buy speed" },
      { cost: 40, name: "DSL", description: "2x buy speed" },
      { cost: 200, name: "Gigabit fiber", description: "4x buy speed" },
      {
        cost: 1000,
        name: "Co-located HFT server",
        description: "8x buy speed",
      },
    ],
  },
  sell: {
    class: "Hardware",
    levels: [
      { cost: 0, name: "Dirty keyboard", description: "1x sell/short speed" },
      { cost: 40, name: "Clean keyboard", description: "2x sell/short speed" },
      {
        cost: 200,
        name: "Gaming keyboard",
        description: "4x sell/short speed",
      },
      {
        cost: 1000,
        name: "Gaming keyboard w/ LEDs",
        description: "8x sell/short speed",
      },
    ],
  },
  hype: {
    class: "Influence",
    levels: [
      { cost: 0, name: "Basic account", description: "1x hype speed" },
      { cost: 40, name: "High karma account", description: "2x hype speed" },
      { cost: 200, name: "Moderator account", description: "4x hype speed" },
      { cost: 1000, name: "Botnet", description: "8x hype speed" },
    ],
  },
  volume: {
    class: "Platform",
    levels: [
      { cost: 0, name: "Nottingham app", description: "1x volume" },
      { cost: 600, name: "Brokerage account", description: "10x volume" },
      {
        cost: 2000,
        name: "Brokerage backchannel",
        description: "100x volume",
      },
    ],
  },
};

class Upgrade extends Component {
  constructor(props) {
    super(props);
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
        <td style={{ minWidth: "290px", whiteSpace: "nowrap" }}>
          {currentLevel.name}{" "}
          {currentLevel.description ? `(${currentLevel.description})` : ""}
        </td>
        <td style={{ minWidth: "100px", whiteSpace: "nowrap" }}>
          {nextLevel ? (
            <Button
              size="small"
              color="primary"
              disabled={this.props.cash <= nextLevel.cost}
              onClick={() =>
                this.props.socket.emit("buy-upgrade", this.props.type)
              }
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
            {Object.keys(upgrades).map((type) => (
              <Upgrade
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
