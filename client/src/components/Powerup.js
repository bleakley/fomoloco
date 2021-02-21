import React, { Component } from "react";
import _ from "lodash";
import { Button } from "@material-ui/core";

class Powerup extends Component {
  constructor(props) {
    super(props);
    this.state = { purchased: false };
  }

  render() {
    return (
      <tr>
        <td style={{ minWidth: "100px", whiteSpace: "nowrap" }}>
          {this.props.name}{" "}
          {this.props.description ? `({this.props.description})` : ""}
        </td>

        <td style={{ minWidth: "100px", whiteSpace: "nowrap" }}>
          {this.state.purchased ? (
            ""
          ) : (
            <Button
              size="small"
              color="primary"
              disabled={this.props.cash <= this.props.buyCost}
              onClick={() =>
                this.props.socket.emit("buy-powerup", this.props.id)
              }
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
