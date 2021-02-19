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

const DEBUG_MODE = true;
const SERVER_URL = process.env.NODE_ENV === 'production' ? "http://fomolo.co:8080" : "http://localhost:8080";

let socket = openConnection(SERVER_URL, {
  query: "username=dfv",
});

const getDefaultState = () => ({
  loginDialogOpen: true,
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

    socket.on("alert", (message) => {
      alert(message);
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
          <Leaderboard socket={this.socket} />
        </Card>
        <Card className="Advertisement">Super annoying ad</Card>
        <Card className="HypeFeed">
          <HypeFeed socket={this.socket} assetDescriptions={this.state.assetDescriptions} />
        </Card>
        <Card className="SecuritiesDashboard">
          <SecuritiesDashboard socket={this.socket} assetDescriptions={this.state.assetDescriptions} />
        </Card>
        <Card className="NewsTicker">
          <NewsTicker socket={this.socket} assetDescriptions={this.state.assetDescriptions} debug={DEBUG_MODE} />
        </Card>
        {DEBUG_MODE && <FpsView top={800} />}
      </div>
    );
  }
}

export default Main;
