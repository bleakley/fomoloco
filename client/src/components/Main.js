import { Card } from '@material-ui/core';
import React, { Component } from 'react';
import '../App.css';

class Main extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="Main">
        <Card className="CashLeaderboard">Cash Leaderboard</Card>
        <Card className="NetWorthLeaderboard">Net worth Leaderboard</Card>
        <Card className="Advertisement">Super annoying ad</Card>
        <Card className="HypeFeed">Hype feed</Card>
        <Card className="SecuritiesDashboard">Securities Dashboard</Card>
        <Card className="NewsTicker">News Ticker</Card>
      </div>
    );
  }
}

export default Main;
