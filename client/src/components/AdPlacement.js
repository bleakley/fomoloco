import React, { Component } from "react";
import PaypalButton from './PaypalButton';

const AdaWallet = 'addr1q9sz5cunrh9r6syfwpd9h6wgv8lpd0c60n4yhetv0m9xdg0kmcxwts5fppwf8zewaw05cc3yvamwzu6ytf9q3923sm6qetwcqk';
const DogeWallet = 'DAbzsgE1oaxLvqsrvfEA1QHTNqXVtDHhtF';

class DonationAd extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                <div style={{display: 'flex', justifyItems: 'center', justifyContent: 'center', marginTop: '20px'}}>🤑 Please support FOMO LOCO web hosting and development 🤑</div>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div style={{display: 'flex', justifyItems: 'center', justifyContent: 'center', marginTop: '20px'}}>
                        <div style={{marginTop: '2px', marginRight: '15px'}}>💎PayPal💎</div>
                        <div><PaypalButton /></div>
                    </div>
                    <div style={{display: 'flex', justifyItems: 'center', justifyContent: 'center', marginTop: '0px'}}>
                        <div style={{marginTop: '18px', marginRight: '15px'}}>🚀ADA🚀</div>
                        <div><pre style={{maxWidth: '150px', overflowX: 'scroll', marginRight: '15px'}}>{AdaWallet}</pre></div>
                        <div style={{marginTop: '18px', marginRight: '15px'}}>📈DOGE📈</div>
                        <div><pre style={{maxWidth: '150px', overflowX: 'scroll'}}>{DogeWallet}</pre></div>
                    </div>
                </div>
            </div>
        )
    }
}

class AdPlacement extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <DonationAd />
        )
    }
}

export default AdPlacement;
