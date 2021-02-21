import React, { Component } from "react";

class PaypalButton extends Component {
    render() {
        return (
            <form action="https://www.paypal.com/donate" method="post" target="_blank">
                <input type="hidden" name="business" value="5B3PS2FN93EJG" />
                <input type="hidden" name="item_name" value="Support FOMO LOCO development and hosting costs" />
                <input type="hidden" name="currency_code" value="USD" />
                <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
                <img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
            </form>
        )
    }
}

export default PaypalButton;
