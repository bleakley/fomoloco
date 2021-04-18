import React, { Component } from "react";
import Powerup from "./Powerup";
import _ from "lodash";

const powerups = [
  {
    id: "market-metrics",
    description: "reveals key metrics",
    buyCost: 300,
    accesible: (upgrades) => upgrades["buy"] >= 1 && upgrades["sell"] >= 1,
    repeatable: false,
  },
  {
    id: "short-selling",
    description: "unlocks short selling",
    buyCost: 800,
    accesible: (upgrades) => upgrades["buy"] >= 2 || upgrades["sell"] >= 2,
    repeatable: false,
  },
  {
    id: "gift",
    description: "",
    buyCost: 10,
    accesible: (upgrades, cash) => cash >= 200,
  },
  {
    id: "astrologer",
    description: "",
    buyCost: 50,
    accesible: (upgrades, cash) => cash >= 50,
  },
];

function getName(powerupId, lovedOne) {
  switch (powerupId) {
    case "astrologer":
      return "Consult an astrologer";
    case "short-selling":
      return "ISDA";
    case "market-metrics":
      return "Gloombourg Terminal";
    case "gift":
      return `Buy a present for your ${lovedOne}`;
    default:
      return "unnamed upgrade";
  }
}

class PowerupPanel extends Component {
  constructor(props) {
    super(props);
    this.lovedOnes = _.shuffle([
      "dog",
      "cat",
      "mom",
      "dad",
      "sister",
      "boyfriend",
      "girlfriend",
      "husband",
      "wife",
      "wife's boyfriend",
      "hamster",
    ]);
  }

  render() {
    return (
      <div>
        <table>
          <tbody>
            {powerups.map((powerup) =>
              powerup.accesible(this.props.upgrades, this.props.cash) &&
              this.props.powerups.indexOf(powerup.id) == -1 ? (
                <Powerup
                  socket={this.props.socket}
                  cash={this.props.cash}
                  id={powerup.id}
                  name={getName(
                    powerup.id,
                    this.lovedOnes[this.props.giftCount % this.lovedOnes.length]
                  )}
                  description={powerup.description}
                  buyCost={powerup.buyCost}
                />
              ) : null
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default PowerupPanel;
