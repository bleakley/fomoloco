import React, { Component } from "react";
import "../App.css";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const MAX_LENGTH = 25;

const truncate = (name) => {
  if (!name) {
    return name;
  }
  if (name.length > MAX_LENGTH) {
    return name.slice(0, MAX_LENGTH - 3) + '...';
  }
  return name;
}

class LeaderboardRow extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let trader = this.props.trader;
    return (
      <TableRow>
        <TableCell>{this.props.rank}.</TableCell>
        <TableCell>{this.props.you ? '🤑' : trader.type ? '😃' : '🤖'}</TableCell>
        <TableCell>
          <b>{trader.name}</b>
        </TableCell>
        <TableCell align="right">${trader.profit}</TableCell>
      </TableRow>
    );
  }
}

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
    let ranksToShow = 10;

    if (this.state.leaderboard.top.length < ranksToShow) {
      return null;
    }

    let playerRanked = this.state.leaderboard.rank <= ranksToShow;

    return (
      <div>
        <Table size="small" padding="none" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Total Profits</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(playerRanked ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [0, 1, 2, 3, 4, 5, 6, 7, 8]).map((index) => (
              <LeaderboardRow key={index} rank={index + 1} trader={this.state.leaderboard.top[index]} you={this.state.leaderboard.top[index].id === this.state.leaderboard.you.id} />
            ))}
            {!playerRanked && (
              <LeaderboardRow rank={this.state.leaderboard.rank} trader={this.state.leaderboard.you} you={true} />
            )}
          </TableBody>
        </Table>
      </div>
    );
  }
}

export default Leaderboard;