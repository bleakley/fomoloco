const cors = require('cors');
const express = require('express');
const app = express();
app.use(cors());
app.use(express.json());

const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    handlePreflightRequest: (req, res) => {
        const headers = {
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Origin': 'http://fomolo.co', //req.headers.origin, //or the specific origin you want to give access to,
            'Access-Control-Allow-Credentials': true
        };
        res.writeHead(200, headers);
        res.end();
    }
});

const port = 8080;

app.get('/status', (req, res) => {
    res.send({ status: 'online' });
});


const getDecodedToken = (socket) => {
    if (production) {
        return socket.decoded_token;
    }
    return {
        id: '5f454699cfe99460cc0b3b92',
        username: 'Unknown Wizard'
    };
};

io.on('connection', function (socket) {
    let userId = getDecodedToken(socket).id;
    let username = getDecodedToken(socket).username;
    console.log(`user ${userId} '${username}' has connected`);
    socket.emit('on-connect');

    socket.on('get-prices', (campaignId) => {
        socket.emit('prices', prices);
    });


    socket.on('buy-asset', (campaignId) => {
    });


    socket.on('sell-asset', (campaignId) => {
    });


    socket.on('shill', (campaignId) => {
    });


    socket.on('buy-upgrade', (campaignId) => {
    });
});

http.listen(port, () => {
    console.log('listening on port ' + port + '...');
});