import React, { Component } from "react";

const HYPE_MESSAGE_PRUNE_COUNT = 20;

class HypeMessage extends Component {
  constructor(props) {
    super(props);
    this.textParts = this.props.message.text.split(
      `\$${this.props.message.symbol}`
    );
  }
  render() {
    let description = this.props.assetDescriptions.find(
      (a) => a.symbol === this.props.message.symbol
    );
    let color = description ? description.color : "black";
    return (
      <div>
        <b>{this.props.message.name}:</b> {this.textParts[0]}{" "}
        <span
          style={{
            color: color,
          }}
        >
          <b>{`\$${this.props.message.symbol}`}</b>
        </span>{" "}
        {this.textParts[1]}{" "}
      </div>
    );
  }
}

class HypeFeed extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hype: [],
    };

    this.props.socket.on("hype-message", (message) => {
      if (this.state.hype.length > 2 * HYPE_MESSAGE_PRUNE_COUNT) {
        this.setState({
          hype: this.state.hype
            .slice(HYPE_MESSAGE_PRUNE_COUNT, this.state.hype.length)
            .concat([message]),
        });
      } else {
        console.log("got new hype");
        this.setState({
          hype: this.state.hype.concat([message]),
        });
      }
    });
  }

  render() {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "100%",
          justifyContent: "flex-end",
        }}
      >
        {this.state.hype.map((message, i) => (
          <HypeMessage
            key={i}
            message={message}
            assetDescriptions={this.props.assetDescriptions}
          />
        ))}
        <div
          style={{ float: "left", clear: "both" }}
          ref={(el) => {
            this.messagesEnd = el;
          }}
        ></div>
      </div>
    );
  }
}

export default HypeFeed;
