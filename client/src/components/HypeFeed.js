import React, { Component } from "react";
import { getAssetColor } from "../utils";

const HYPE_MESSAGE_PRUNE_COUNT = 20;

class HypeMessage extends Component {
  constructor(props) {
    super(props);
    this.textParts = this.props.message.text.split(
      `\$${this.props.message.symbol}`
    );
  }
  render() {
    return (
      <div>
        <b>{this.props.message.name}:</b> {this.textParts[0]}{" "}
        <span
          style={{
            color: getAssetColor(this.props.message.symbol, this.props.symbols),
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
      symbols: [],
    };

    this.props.socket.on("prices", (prices) => {
      this.setState({ symbols: prices.map((asset) => asset.symbol) });
    });

    this.props.socket.on("hype-message", (message) => {
      if (!window.focused) return;
      if (this.state.hype.length > 2 * HYPE_MESSAGE_PRUNE_COUNT) {
        this.setState({
          hype: this.state.hype
            .slice(HYPE_MESSAGE_PRUNE_COUNT, this.state.hype.length)
            .concat([message]),
        });
      } else {
        this.setState({ hype: this.state.hype.concat([message]) });
      }
    });
  }

  scrollToBottom() {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  }

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  render() {
    return (
      <div>
        {this.state.hype.map((message) => (
          <HypeMessage message={message} symbols={this.state.symbols}/>
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
