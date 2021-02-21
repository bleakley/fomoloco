import React, { Component } from "react";
import Powerup from "./Powerup";
import _ from "lodash";

class PowerupPanel extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <table>
          <tbody>
            {this.props.upgrades["buy"] >= 1 &&
            this.props.upgrades["sell"] >= 1 &&
            this.props.powerups.indexOf("market-metrics") == -1 ? (
              <Powerup
                socket={this.props.socket}
                cash={this.props.cash}
                id="market-metrics"
                name="Glombourg Terminal"
                description="reveals key metrics"
                buyCost={400}
              />
            ) : (
              ""
            )}
            {this.props.upgrades["volume"] >= 1 &&
            this.props.powerups.indexOf("short-selling") == -1 ? (
              <Powerup
                socket={this.props.socket}
                cash={this.props.cash}
                id="short-selling"
                name="ISDA"
                description="unlocks short selling"
                buyCost={1000}
              />
            ) : (
              ""
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default PowerupPanel;
