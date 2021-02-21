import React, { Component } from "react";
import Powerup from "./Powerup";
import _ from "lodash";

const powerups = [
  {
    id: "market-metrics",
    name: "Glombourg Terminal",
    description: "reveals key metrics",
    buyCost: 400,
    accesible: (upgrades) => upgrades["buy"] >= 1 && upgrades["sell"] >= 1,
  },
  {
    id: "short-selling",
    name: "ISDA",
    description: "unlocks short selling",
    buyCost: 1000,
    accesible: (upgrades) => upgrades["volume"] >= 1,
  },
];

class PowerupPanel extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <table>
          <tbody>
            {powerups.map((powerup) =>
              powerup.accesible(this.props.upgrades) &&
              this.props.powerups.indexOf(powerup.id) == -1 ? (
                <Powerup
                  socket={this.props.socket}
                  cash={this.props.cash}
                  id={powerup.id}
                  name={powerup.name}
                  description={powerup.description}
                  buyCost={powerup.buyCost}
                />
              ) : (
                ""
              )
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default PowerupPanel;
