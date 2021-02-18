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
    let description = this.props.assetDescriptions.find(a => a.symbol === this.props.message.symbol);
    let color = description ? description.color : 'black';
    return (
      <div>
        <b>{this.props.message.name}:</b> {this.textParts[0]}{" "}
        <span
          style={{
            color: color
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
      hype: []
    };

    this.props.socket.on("hype-message", (message) => {
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
          <HypeMessage message={message} assetDescriptions={this.props.assetDescriptions}/>
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
