import React, { Component } from 'react';
import '../App.css';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

class Leaderboard extends Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      <TableContainer component={Paper}>
      <Table size="small" aria-label="Leaderboard">
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell align="right">Net Worth</TableCell>
            <TableCell align="right">Cash</TableCell>
            <TableCell align="right">Profit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.props.highScores.map((row) => (
            <TableRow key={row.name}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">${row.netWorth}</TableCell>
              <TableCell align="right">${row.cash}</TableCell>
              <TableCell align="right">${row.profit}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    );
  }
}

export default Leaderboard;
