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
import AdPlacement from "./AdPlacement";

const DEBUG_MODE = false;
const SERVER_URL = process.env.REACT_APP_SERVER_URL || (process.env.NODE_ENV === 'production' ? "http://fomolo.co" : "http://localhost:8080");
const googleBlockedMessage = "We don't run any real ads on this site - just funny ads that are part of the game. But we do use Google for analytics, so please whitelist us in your adblocker! Thank you.";

let socket = openConnection(SERVER_URL, {
  query: "username=dfv",
});

const getDefaultState = () => ({
  loginDialogOpen: false,
  assetDescriptions: []
});

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = getDefaultState();

    this.socket = socket;

    socket.on("assetDescriptions", (descriptions) => {
      this.setState({
        assetDescriptions: descriptions
      });
    });

    socket.on("usernameSuggestion", () => {
      this.setState({
        loginDialogOpen: true,
      });
    });

    socket.on("usernameRejected", (res) => {
      this.setState({
        loginDialogOpen: true,
      });
      let reason = 'not available';
      if (res && res.reason) {
        reason = res.reason;
      }
      alert(`That username is ${reason}. Please pick another one.`);
    });

    socket.on("alert", (message) => {
      alert(message);
    });
  }

  componentDidMount() {
    if (window.googleBlocked) {
      console.log(googleBlockedMessage);
    }
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
    // TODO: React.StrictMode causes an error with MaterialUI < 5.0.0
    // Until that's fixed we're moving StrictMode down from the top level component
    // see https://stackoverflow.com/questions/61220424/material-ui-drawer-finddomnode-is-deprecated-in-strictmode

    return (
      <div className="Main">
        <LoginDialog
          socket={this.socket}
          open={this.state.loginDialogOpen}
          onClose={() => this.onLoginDialogClose()}
        />
        <React.StrictMode>
          <Card className="CashLeaderboard">
            <Leaderboard socket={this.socket} />
          </Card>
          <Card className="Advertisement">
            <AdPlacement assetDescriptions={this.state.assetDescriptions} />
          </Card>
          <Card className="HypeFeed">
            <HypeFeed socket={this.socket} assetDescriptions={this.state.assetDescriptions} />
          </Card>
          <SecuritiesDashboard socket={this.socket} assetDescriptions={this.state.assetDescriptions} />
          <Card className="NewsTicker">
            <NewsTicker socket={this.socket} assetDescriptions={this.state.assetDescriptions} debug={DEBUG_MODE} />
          </Card>
          <a className="DiscordLink" href="https://discord.gg/vjZtHw9Fnw" target="_blank"><img src="Discord-Logo-White.png" width="45px" height="45px" /></a>
          {DEBUG_MODE && <FpsView top={800} />}
        </React.StrictMode>
      </div>
    );
  }
}

export default Main;
