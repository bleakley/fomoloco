import React, { Component } from "react";
import _ from "lodash";
import { Button } from "@material-ui/core";

class Powerup extends Component {
  constructor(props) {
    super(props);
    this.state = { purchased: false };
  }

  buy() {
    this.props.socket.emit("buy-powerup", this.props.id);
    window.gtag("event", "buy_powerup", {
      send_to: "G-XF7G8SENJW",
      id: this.props.id,
      name: this.props.name,
    });
  }

  render() {
    return (
      <tr>
        <td style={{ minWidth: "300px", whiteSpace: "nowrap" }}>
          {this.props.name}{" "}
          {this.props.description ? `(${this.props.description})` : ""}
        </td>

        <td style={{ minWidth: "100px", whiteSpace: "nowrap" }}>
          {this.state.purchased ? (
            ""
          ) : (
            <Button
              size="small"
              color="primary"
              disabled={this.props.cash <= this.props.buyCost}
              onClick={() => this.buy()}
            >
              Purchase ${this.props.buyCost}
            </Button>
          )}
        </td>
      </tr>
    );
  }
}

export default Powerup;
