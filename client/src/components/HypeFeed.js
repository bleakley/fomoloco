import React, { Component } from 'react';

const HYPE_MESSAGE_PRUNE_COUNT = 20;

class HypeFeed extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hype: []
    }

    this.props.socket.on("hype-message", (message) => {
      if (!window.focused) return;
      if (this.state.hype.length > 2 * HYPE_MESSAGE_PRUNE_COUNT) {
        this.setState({
          hype: this.state.hype.slice(
              HYPE_MESSAGE_PRUNE_COUNT,
              this.state.hype.length
            ).concat([message]) 
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
        {this.state.hype.map(message => (<div><b>{message.name}:</b> {message.text}</div>))}
        <div style={{ float:"left", clear: "both" }}
             ref={(el) => { this.messagesEnd = el; }}>
        </div>
      </div>
    );
  }
}

export default HypeFeed;
