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
            {/* <Powerup
              socket={this.props.socket}
              cash={this.props.cash}
              name="Glombourg Terminal"
              description="reveals short interest"
              buyCost="1000"
            /> */}
            {this.props.upgrades["volume"] >= 1 &&
            this.props.powerups.indexOf("short-selling") == -1 ? (
              <Powerup
                socket={this.props.socket}
                cash={this.props.cash}
                id="short-selling"
                name="ISDA"
                description="unlocks short selling"
                buyCost="1000"
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
