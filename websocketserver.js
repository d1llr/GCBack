// const WebSocket = require('ws');
// const fs = require('node:fs');
// var https = require('http');

// const options = {
//     key: fs.readFileSync('/etc/letsencrypt/live/back.pacgc.pw/privkey.pem'),
//     cert: fs.readFileSync('/etc/letsencrypt/live/back.pacgc.pw/cert.pem'),
// };


// function WebSocketInit(app) {
//     const server = https.createServer(options, function (req, res) {
//         res.write('Hello World!'); //write a response to the client
//         res.end(); //end the response]
//         console.log('started ws server');
//     });


//     var wss = new WebSocket.Server({ server });

//     wss.on('connection', (ws) => {
//         ws.on('message', function incoming(message) {
//             console.log('received: %s', JSON.parse(message));
//         });

//         // users.afterBulkUpdate((user, options) => {
//         //     console.log('balance updated');
//         //     ws.send(JSON.stringify({ type: 'balance', message: user.balance }));
//         // });

//     })

//     server.listen(7070, function () {
//         console.log('Server is running on port 7070');
//     });



// }



const wsSend = function (data, wsConnection) {
    // readyState - true, если есть подключение
    if (!wsConnection.readyState) {
        setTimeout(function () {
            wsSend(data);
        }, 100);
    } else {
        wsConnection.send(data);
    }
};


// const sendMessage = (balance,) => {
//     console.log('ya tut');
//     wss.on('connection', (ws) => {
//         ws.send(JSON.stringify({ type: 'balance', message: balance }));
//     })
// }


module.exports = { wsSend }