import React, { Component } from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogContentText from "@material-ui/core/DialogContentText";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";

class LoginDialog extends Component {
  constructor(props) {
    super(props);
    this.state = { name: "dfv" };
  }

  handleClose() {
    this.props.onClose();
  }

  handleSubmit() {
    this.props.socket.emit("set-username", this.state.name);
    this.props.onClose();
  }

  handleKeyPress(event) {
    if (event.code === "Enter") this.handleSubmit();
  }

  render() {
    return (
      <Dialog
        onClose={() => this.handleClose()}
        aria-labelledby="simple-dialog-title"
        open={this.props.open}
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
      >
        {/* <DialogTitle id="simple-dialog-title">Enter username</DialogTitle> */}
        <DialogContent>
          <TextField
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            autoFocus
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            value={this.state.name}
            onChange={(event) => this.setState({ name: event.target.value })}
            onKeyPress={(event) => this.handleKeyPress(event)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.handleSubmit()} color="primary">
            🚀 Blastoff 🚀
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default LoginDialog;
