import React, { Component } from 'react';

class HypeFeed extends Component {
  constructor(props) {
    super(props);
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
        {this.props.hype.map(message => (<div><b>{message.name}:</b> {message.text}</div>))}
        <div style={{ float:"left", clear: "both" }}
             ref={(el) => { this.messagesEnd = el; }}>
        </div>
      </div>
    );
  }
}

export default HypeFeed;
