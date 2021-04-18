import React, { Component } from "react";
import _ from "lodash";
import Tooltip from "@material-ui/core/Tooltip";
import CooldownTimer from "./CooldownTimer.js";
import AssetRows from "./AssetRows.js";

const ASSUMED_DIVIDEND_PERIOD = 30;

class DividendRow extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <tr key={"dividend-row"}>
        <td>
          <Tooltip
            title={
              <div style={{ fontSize: "1.4em", minWidth: "200px" }}>
                Companies periodically pay dividends to their shareholders based
                on how successful the business is. In the last dividend period,
                you received {`\$${this.props.lastDividend}`}.
              </div>
            }
            placement="right"
          >
            <div style={{ position: "relative", marginTop: "5px" }}>
              <b>Dividend</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <div
                style={{
                  position: "absolute",
                  top: "2px",
                  left: "72px",
                }}
              >
                <CooldownTimer
                  current={this.props.timeToNextDividend}
                  max={this.props.dividendPeriod}
                />
              </div>
            </div>
          </Tooltip>
        </td>
        <td>{`\$${this.props.lastDividend}`}</td>
      </tr>
    );
  }
}

class CashRow extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <tr key={"cash-row"}>
        <td style={{ minWidth: "100px" }}>
          <b>Cash</b>
        </td>
        <td>
          <span>{`\$${this.props.cash}`}</span>
          &nbsp;
          <span id="cashAnimation" style={{ position: "absolute" }} />
        </td>
      </tr>
    );
  }
}

class MarginRow extends Component {
  constructor(props) {
    super(props);
  }

  isMarginSafe() {
    return this.props.margin > 150;
  }

  render() {
    if (this.props.shortSellingUnlocked) {
      return (
        <tr key={"margin-row"}>
          <td>
            <Tooltip
              title={
                <div style={{ fontSize: "1.4em", minWidth: "200px" }}>
                  If the value of your shares and cash relative to the value of
                  shares you have borrowed is below 200% when margin call
                  happens, your broker may use your shares and cash to close out
                  all or part of your short position.
                </div>
              }
              placement="right"
            >
              <div style={{ position: "relative", marginTop: "5px" }}>
                <b>Margin</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <div
                  style={{
                    position: "absolute",
                    top: "2px",
                    left: "72px",
                  }}
                >
                  <CooldownTimer
                    current={this.props.timeToNextMarginCheck}
                    max={20}
                  />
                </div>
              </div>
            </Tooltip>
          </td>
          <td
            style={{
              color: this.props.margin
                ? this.isMarginSafe()
                  ? "green"
                  : "red"
                : "black",
            }}
          >{`${
            this.props.margin
              ? `${this.props.margin > 1000 ? ">1000" : this.props.margin}%`
              : "-"
          }`}</td>
        </tr>
      );
    } else {
      return <tr style={{ height: "12px" }}></tr>;
    }
  }
}

class TransactionPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lastDividend: 0,
      dividendPeriod: ASSUMED_DIVIDEND_PERIOD,
      timeToNextDividend: ASSUMED_DIVIDEND_PERIOD,
      timeToNextMarginCheck: 20,
      marketMetrics: [],
    };
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({
        buyTime: Math.max(0, this.state.buyTime - 0.1),
        sellTime: Math.max(0, this.state.sellTime - 0.1),
        hypeTime: Math.max(0, this.state.hypeTime - 0.1),
        timeToNextDividend: Math.max(0, this.state.timeToNextDividend - 0.1),
        timeToNextMarginCheck: Math.max(
          0,
          this.state.timeToNextMarginCheck - 0.1
        ),
      });
    }, 100);

    this.props.socket.on("dividend", (transaction) => {
      this.setState({
        lastDividend: transaction.totalPayout,
        timeToNextDividend: transaction.timeToNextDividend,
        dividendPeriod: transaction.timeToNextDividend,
      });
    });

    this.props.socket.on("margin-call", (marginCallEvent) => {
      this.setState({
        timeToNextMarginCheck: marginCallEvent.timeToNextMarginCheck,
      });
    });

    this.props.socket.on("market-metrics", (marketMetrics) => {
      this.setState({
        marketMetrics,
      });
    });
  }

  getMargin() {
    let totalHoldings = parseFloat(this.props.cash);
    let totalBorrowed = 0;
    Object.keys(this.props.playerHoldings).forEach((symbol) => {
      if (this.props.playerHoldings[symbol]) {
        if (this.props.playerHoldings[symbol] > 0) {
          totalHoldings +=
            this.props.playerHoldings[symbol] *
            parseFloat(this.props.currentPrices[symbol]);
        } else {
          totalBorrowed -=
            this.props.playerHoldings[symbol] *
            parseFloat(this.props.currentPrices[symbol]);
        }
      }
    });
    if (totalBorrowed === 0) return null;
    else return ((100 * totalHoldings) / totalBorrowed).toFixed(0);
  }

  shortSellingUnlocked() {
    return this.props.powerups.indexOf("short-selling") > -1;
  }

  metricsUnlocked() {
    return this.props.powerups.indexOf("market-metrics") > -1;
  }

  componentDidUpdate(prevProps) {
    let cashDelta = this.props.cash - prevProps.cash;
    if (cashDelta) {
      this.animateCash(cashDelta);
    }
  }

  animateCash(cashDelta) {
    let deltaString = (cashDelta < 0 ? "" : "+") + cashDelta.toFixed(2);
    let positive = cashDelta >= 0;

    const b = document.createElement("b");
    b.innerText = deltaString;
    b.className = positive ? "cashGainAnimation" : "cashLossAnimation";

    b.onanimationend = () =>
      document.getElementById("cashAnimation").removeChild(b);
    document.getElementById("cashAnimation").appendChild(b);
  }

  render() {
    return (
      <div style={{ userSelect: "none" }}>
        <AssetRows
          playerHoldings={this.props.playerHoldings}
          upgrades={this.props.upgrades}
          currentPrices={this.props.currentPrices}
          marketMetrics={this.state.marketMetrics}
          assetDescriptions={this.props.assetDescriptions}
          shortSellingUnlocked={this.shortSellingUnlocked()}
          metricsUnlocked={this.metricsUnlocked()}
          socket={this.props.socket}
        />
        <table style={{ marginTop: "16px" }}>
          <tbody>
            <CashRow cash={this.props.cash} />
            <DividendRow
              lastDividend={this.state.lastDividend}
              timeToNextDividend={this.state.timeToNextDividend}
              dividendPeriod={this.state.dividendPeriod}
            />
            <MarginRow
              margin={this.getMargin()}
              shortSellingUnlocked={this.shortSellingUnlocked()}
              timeToNextMarginCheck={this.state.timeToNextMarginCheck}
            />
          </tbody>
        </table>
      </div>
    );
  }
}

export default TransactionPanel;
