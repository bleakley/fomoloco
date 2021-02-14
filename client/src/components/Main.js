import { Card } from '@material-ui/core';
import EventEmitter from 'events';
import _ from 'lodash';
import React, { Component } from 'react';
import '../App.css';
import Leaderboard from './Leaderboard';
import NewsTicker from './NewsTicker';
import HypeFeed from './HypeFeed';


const hypeEmitter = new EventEmitter();
setInterval(() => {
  let sampleHype = [
    {name: 'astro', text: 'BUY BUY $GMME to the fucking MOOOOON 🚀🚀🚀'},
    {name: 'chungus', text: '🤑 Just sold my house- gotta buy more $HYPE 🤑'},
    {name: 'stockslut', text: `I'm so HORNY for $BITZ 😍🥵🥵💦`},
    {name: 'apeman', text: `APES STRONGER TOGETHER - BUY $YOLO 🍌🍌🍌🐵🐵🐵`}
  ];
  hypeEmitter.emit('hype', _.sample(sampleHype));
}, 500);

const HYPE_MESSAGE_PRUNE_COUNT = 50;

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
      ],
      hype: []
    }

    hypeEmitter.on('hype', message => {
      if (this.state.hype.length > 2 * HYPE_MESSAGE_PRUNE_COUNT) {
        this.setState({ hype: [...this.state.hype.slice(HYPE_MESSAGE_PRUNE_COUNT, this.state.hype.length), message]});
      } else {
        this.setState({ hype: [...this.state.hype, message]});
      }
    });
  }

  render() {
    return (
      <div className="Main">
        <Card className="CashLeaderboard"><Leaderboard highScores={this.state.leaderboard} /></Card>
        <Card className="Advertisement">Super annoying ad</Card>
        <Card className="HypeFeed"><HypeFeed hype={this.state.hype} /></Card>
        <Card className="SecuritiesDashboard">Securities Dashboard</Card>
        <Card className="NewsTicker"><NewsTicker news={this.state.news} /></Card>
      </div>
    );
  }
}

export default Main;
