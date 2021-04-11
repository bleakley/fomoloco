const _ = require("lodash");
let Market = require("./Market.js");

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const MAX_DESIRED_MARKET_AGE = 20 * MINUTE;
const MAX_DESIRED_PLAYERS = 20;
const MAX_MARKET_AGE = 5 * HOUR;

class MarketManager {
    constructor(io) {
        this.io = io;
        this.markets = [];
        this.marketsCulled = 0;

        setInterval(() => this.cullMarkets(), 1 * MINUTE);
    }

    getStats() {
        return {
            marketsActive: this.markets.length,
            marketsCulled: this.marketsCulled,
            markets: this.markets.map(market => ({
                players: market.getPlayers().map(p => p.name),
                playerCount: market.getPlayers().length,
                playersQuit: market.playersQuitCount,
                bots: market.getBots().length,
                botsCulled: market.botsCulledCount,
                hours: (market.getAge() / (HOUR)),
                assets: market.assets,
            }))
        }
    }

    boost(symbol) {
        this.markets.forEach(m => m.boost(symbol));
    }
 
    getNextMarket() {
        let nextMarket = this.markets.find(market => market.getPlayers().length < MAX_DESIRED_PLAYERS && market.getAge() < MAX_DESIRED_MARKET_AGE);
        if (nextMarket) {
            return nextMarket;
        } else {
            nextMarket = new Market(this.io);
            this.markets.push(nextMarket);
            console.log(new Date().toString() + " new market created");
            return nextMarket;
        }
    }

    getMarketById(id) {
        return this.markets.find(market => market.id === id);
    }

    cullMarkets() {
        let marketsToKill = _.remove(this.markets, market => market.getAge() > MAX_MARKET_AGE || !market.getPlayers().length);
        this.marketsCulled += marketsToKill.length;
    }
}

module.exports = MarketManager;
