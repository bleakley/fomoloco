import React, { Component } from "react";
import "../App.css";

class Leaderboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      leaderboard: {rank: 0, total: 0, top: []},
      leaderboardLastUpdated: Date.now()
    };

    this.props.socket.on("leaderboard", (leaderboard) => {
      this.setState({
        leaderboard: leaderboard,
        leaderboardLastUpdated: Date.now(),
      });
    });
  }

  render() {
    return (
      <div>
        <div>Total Profits (<em>your rank: {this.state.leaderboard.rank} of {this.state.leaderboard.total}</em>)</div>
        <br />
        <div style={{display: 'grid', gridTemplate: '1fr 1fr 1fr 1fr 1fr / 1fr', gridAutoFlow: 'column', columnGap: '10px'}}>
        {this.state.leaderboard.top.map((row, i) => (
            <div key={i} style={{display: 'flex', justifyContent: 'space-between'}}>
              <div>{i + 1}. <b>{row.name}</b></div>
              <div>${row.profit}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default Leaderboard;
