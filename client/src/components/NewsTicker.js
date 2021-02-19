import React, { Component } from "react";
import Ticker from "react-ticker";
import _ from "lodash";

let serverNews = [];

class NewsTicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      serverNewsCount: 0,
      expiredNewsCount: 0
    }

    this.localNews = _.shuffle([
      { text: "Florida man wins lottery after receiving COVID-19 vaccine" },
      {
        text:
          "New study links black-rinded futsu squash to lower rates of Groat's disease",
      },
      {
        text:
          "Colorado man dies in car crash after receiving COVID-19 vaccine",
      },
      {
        text:
          "Mercury in retrograde causes loss of NASA spacecraft during attempted landing on the inner planet",
      },
      {
        text:
          "BREAKING NEWS",
      }
    ]);

    this.props.socket.on("news", (news) => {
      serverNews.push({...news, receivedAt: new Date()});
      this.setState({serverNewsCount: this.state.serverNewsCount + 1})
    });
  }

  changeSymbolColors(text) {
    let updatedText = text;
    this.props.assetDescriptions.forEach(asset => {
      let color = asset.color || 'black';
      updatedText = updatedText.replace('$' + asset.symbol, `<span style="color: ${color}">\$${asset.symbol}</span>`)
    });
    return updatedText;
  }

  getNewsText(index) {
    if (serverNews.length) {
      this.setState({serverNewsCount: this.state.serverNewsCount - 1})
      let news = serverNews.shift();
      let age = new Date() - news.receivedAt;
      if (age < 60000) {
        return news;
      } else {
        let numberToThrowAway = serverNews.length - 1;
        if (numberToThrowAway > 0) {
          serverNews = [serverNews[numberToThrowAway]];
          this.setState({expiredNewsCount: this.state.expiredNewsCount + numberToThrowAway + 1})
        }
        return this.getNewsText(index);
      }
    }
    return this.localNews[index % this.localNews.length];
  }

  render() {
    return (
      <span>
        {this.props.debug && <span style={{position: 'absolute', bottom: 10}}>{this.state.serverNewsCount} news items in queue, {this.state.expiredNewsCount} thrown away</span>}
        <Ticker>
          {({ index }) => (
            <span>
              <b>
                <span dangerouslySetInnerHTML={{__html: this.changeSymbolColors(this.getNewsText(index).text)}} />
                &nbsp;•&nbsp;
              </b>
            </span>
          )}
        </Ticker>
      </span>
    );
  }
}

export default NewsTicker;
