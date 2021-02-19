import React, { Component } from "react";
import "../App.css";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

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
        <div>Your rank: {this.state.leaderboard.rank} of {this.state.leaderboard.total}</div>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="Leaderboard">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell align="right">
                <b>Net Worth</b>
              </TableCell>
              <TableCell align="right">
                <b>Cash</b>
              </TableCell>
              <TableCell align="right">
                <b>Profit</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.leaderboard.top.map((row) => (
              <TableRow
                key={`${row.name},${this.state.leaderboardLastUpdated}`}
              >
                <TableCell component="th" scope="row">
                  <i>{row.name}</i>
                </TableCell>
                <TableCell align="right">${row.netWorth}</TableCell>
                <TableCell align="right">${row.cash}</TableCell>
                <TableCell align="right">${row.profit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </div>
    );
  }
}

export default Leaderboard;
