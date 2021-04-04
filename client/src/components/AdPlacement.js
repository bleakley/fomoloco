import React, { Component } from "react";
import PaypalButton from "./PaypalButton";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";

const ads = ['BB', 'BVR', 'MNC', 'SDG', 'help'];

class DonateDialog extends Component {
  constructor(props) {
    super(props);
  }

  handleClose() {
    this.props.onClose();
  }

  render() {
    let asset = this.props.assetDescriptions.find(a => a.symbol === this.props.symbol) || {};
    return (
      <Dialog
        onClose={() => this.handleClose()}
        aria-labelledby="simple-dialog-title"
        open={this.props.open}
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
      >
        <DialogContent>
          <p style={{textAlign: 'center'}}>🤑 Please support FOMO LOCO web hosting and development 🤑</p>
          <p>Donating via PayPal helps us keep this game running, and there's a special bonus as well! Because you clicked on the ad for {asset.name}, you must really like the stock. By donating, you'll be supporting <span style={{color: asset.color}}><b>${asset.symbol}</b></span>.</p>
          <p>At the end of each day, the asset that received the highest donation total will get a boost to its fundamental value (on all servers) the following day. This information is made public in the news ticker and does not provide any player with a competitive advantage, it's just for fun!</p>
        </DialogContent>
        <DialogActions>
          <PaypalButton symbol={this.props.symbol} />
          <Button onClick={() => this.handleClose()} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class HelpAd extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{margin: "10px"}}>
        <p style={{textAlign: 'center'}}>🤑 Thanks for playing FOMO LOCO! 🤑</p>
        <p>We've set up a small discord server to talk about the game.</p>
        <p>Please reach out if you have any questions, bug reports, suggestions, or if you want to chat with other players.</p>
        <p style={{textAlign: 'center'}}><a href="https://discord.gg/vjZtHw9Fnw" target="_blank">discord.gg/vjZtHw9Fnw</a></p>
      </div>
    );
  }
}

class AdPlacement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      adIndex: 0,
      donateDialogOpen: false,
      donateTo: null
    };
  }

  componentDidMount() {
    setInterval(() => this.setState({adIndex: (this.state.adIndex + 1) % ads.length}), 60 * 1000)
  }

  render() {
    let ad = ads[this.state.adIndex];
    let showHelp = ad === 'help';
    return <>
      <DonateDialog
        open={this.state.donateDialogOpen}
        onClose={() => this.setState({ donateDialogOpen: false, donateTo: null })}
        symbol={this.state.donateTo}
        assetDescriptions={this.props.assetDescriptions}
      />
      { showHelp ? <HelpAd /> :
      <img src={`${ad.toLowerCase()}_ad.png`} width="380px" height="250px" style={{cursor: 'pointer'}} onClick={() => this.setState({ donateDialogOpen: true, donateTo: ad })} />
      }
    </>;
  }
}

export default AdPlacement;