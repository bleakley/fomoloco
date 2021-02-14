import { Card } from '@material-ui/core';
import React, { Component } from 'react';
import '../App.css';
import Leaderboard from './Leaderboard';
import NewsTicker from './NewsTicker';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      leaderboard: [{name: 'CryptoFOMO', netWorth: 253490, cash: 253490, profit: 253490}, {name: 'u/deepfuckingvalue', netWorth: 963495, cash: 963495, profit: 963495}],
      news: [
        {text: 'BREAKING NEWS'},
        {text: '$GMME announces cloud-first quantum mainnet for Q3'},
        {text: '8 killed and 35 wounded in $YOLO-inspired massacre'},
        {text: 'Hackers from 5chan exploit $BITZ zero day vulnerability'},
        {text: 'Analysts say $HYPE trading 3 times above target'}
      ]
    }
  }

  render() {
    return (
      <div className="Main">
        <Card className="CashLeaderboard"><Leaderboard highScores={this.state.leaderboard} /></Card>
        <Card className="Advertisement">Super annoying ad</Card>
        <Card className="HypeFeed">Hype feed</Card>
        <Card className="SecuritiesDashboard">Securities Dashboard</Card>
        <Card className="NewsTicker"><NewsTicker news={this.state.news} /></Card>
      </div>
    );
  }
}

export default Main;
