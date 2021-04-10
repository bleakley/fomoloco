import React, { Component } from "react";
import Ticker from "react-ticker";
import _ from "lodash";

let serverNews = [];

const getLocalNewsItem = () => _.sample([
    {
      text: `${_.sample([
        "Florida",
        "Connecticut",
        "Georgia",
        "Colorado",
      ])} ${_.sample(["man", "woman"])} ${_.sample([
        "wins lottery",
        "dies in car crash",
        "struck by lightning",
      ])} after receiving COVID-19 vaccine`,
    },
    {
      text:
        `New study links black-rinded futsu squash to ${_.sample(['higher', 'lower', 'lower', 'lower'])} rates of Groat's disease`,
    },
    {
      text: `${_.sample([
        "Misinterpretation of horoscope",
        "Scientist's dog",
      ])} blamed for loss of spacecraft during attempted flyby of ${_.sample([
        "Mars",
        "Jupiter",
        "Venus",
      ])}`,
    },
    {
      text: `Video shows ${_.sample([
        "dog",
        "goat",
        "horse",
      ])} save ${_.sample([
        "cat",
        "guinea pig",
        "baby racoon",
        "kitten",
        "hedgehog",
      ])} from ${_.sample(["fire", "drowning", "shark"])} `,
    },
    {
      text: "BREAKING NEWS",
    },
  ]);


class NewsTicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      serverNewsCount: 0,
      expiredNewsCount: 0,
    };
  }

  componentDidMount() {
    this.props.socket.on("news", (news) => {
      serverNews.push({ ...news, receivedAt: new Date() });
      this.setState({ serverNewsCount: serverNews.length });
    });
  }

  changeSymbolColors(text) {
    let updatedText = text;
    this.props.assetDescriptions.forEach((asset) => {
      let color = asset.color || "black";
      updatedText = updatedText.replace(
        "$" + asset.symbol,
        `<span style="color: ${color}">\$${asset.symbol}</span>`
      );
    });
    return updatedText;
  }

  getNewsText(index) {
    if (serverNews.length) {
      let news = serverNews.shift();
      let age = new Date() - news.receivedAt;
      this.setState({ serverNewsCount: serverNews.length });
      if (age < 60000) {
        return news;
      } else {
        let numberToThrowAway = serverNews.length - 1;
        if (numberToThrowAway > 0) {
          serverNews = [serverNews[numberToThrowAway]];
          this.setState({
            serverNewsCount: serverNews.length,
            expiredNewsCount:
              this.state.expiredNewsCount + numberToThrowAway + 1,
          });
        }
        return this.getNewsText(index);
      }
    }
    return getLocalNewsItem();
  }

  render() {
    return (
      <span>
        {this.props.debug && (
          <span style={{ position: "absolute", bottom: 10 }}>
            {this.state.serverNewsCount} news items in queue,{" "}
            {this.state.expiredNewsCount} thrown away
          </span>
        )}
        <Ticker>
          {({ index }) => (
            <span>
              <b>
                <span
                  dangerouslySetInnerHTML={{
                    __html: this.changeSymbolColors(
                      this.getNewsText(index).text
                    ),
                  }}
                />
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
