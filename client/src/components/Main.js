import { Card } from "@material-ui/core";
import { FpsView } from "react-fps";
import _ from "lodash";
import React, { Component } from "react";
import "../App.css";
import LoginDialog from "./LoginDialog";
import Leaderboard from "./Leaderboard";
import NewsTicker from "./NewsTicker";
import HypeFeed from "./HypeFeed";
import SecuritiesDashboard from "./SecuritiesDashboard";
import openConnection from "socket.io-client";

let socket = openConnection("http://localhost:8080", {
  query: "username=dfv",
});

const getDefaultState = () => ({
  leaderboard: [],
  leaderboardLastUpdated: Date.now(),
  loginDialogOpen: true,
});

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = getDefaultState();

    this.socket = socket;

    socket.on("leaderboard", (leaderboard) => {
      if (!window.focused) return;
      this.setState({
        leaderboard: leaderboard,
        leaderboardLastUpdated: Date.now(),
      });
    });
  }

  componentDidMount() {
    window.focused = true;
    window.addEventListener("focus", this.onFocus);
    window.addEventListener("blur", this.onLoseFocus);
  }

  componentWillUnmount() {
    window.removeEventListener("focus", this.onFocus);
    window.removeEventListener("blur", this.onLoseFocus);
  }

  onFocus = (e) => {
    window.focused = true;
  };
  onLoseFocus = (e) => {
    window.focused = false;
  };

  onLoginDialogClose() {
    this.setState({ loginDialogOpen: false });
  }

  render() {
    return (
      <div className="Main">
        <LoginDialog
          socket={this.socket}
          open={this.state.loginDialogOpen}
          onClose={() => this.onLoginDialogClose()}
        />
        <Card className="CashLeaderboard">
          <Leaderboard
            highScores={this.state.leaderboard}
            leaderboardLastUpdated={this.state.leaderboardLastUpdated}
          />
        </Card>
        <Card className="Advertisement">Super annoying ad</Card>
        <Card className="HypeFeed">
          <HypeFeed socket={this.socket} />
        </Card>
        <Card className="SecuritiesDashboard">
          <SecuritiesDashboard socket={this.socket} />
        </Card>
        <Card className="NewsTicker">
          <NewsTicker socket={this.socket} />
        </Card>
        <FpsView top={800} />
      </div>
    );
  }
}

export default Main;
