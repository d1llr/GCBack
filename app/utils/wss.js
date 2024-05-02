import pkg from 'ws';
import { createServer } from "http";
import { readFileSync } from "node:fs";
import db from "../models/index.js";
import { log } from 'console';
const users = db.user;

const { Server } = pkg;

const options = {
    key: readFileSync("/etc/letsencrypt/live/back.pacgc.pw/privkey.pem"),
    cert: readFileSync("/etc/letsencrypt/live/back.pacgc.pw/cert.pem"),
};

const server = createServer(options, function (req, res) {
    res.write("Hello World!"); //write a response to the client
    res.end(); //end the response]
    console.log("started ws server");
});

var wss = new Server({ server });
var WSS_CLIENTS = {};
const wssInit = (port = 9191) => {

    wss.on("connection", async (ws) => {
        ws.send(JSON.stringify({ type: "connect", message: "wss connection successful" }));
        console.log('send a new message to user');
        ws.on("message", function incoming(message) {
            const msg = JSON.parse(message);
            switch (msg.type) {
                case "auth":
                    WSS_CLIENTS[msg.message] = ws;
                    WSS_CLIENTS[msg.message].on('close', function () {
                        console.log('wss connection closed by user[' + msg.message + ']');
                        delete WSS_CLIENTS[msg.message];
                    });
                    break;


                default:
                    break;
            }
            console.log("received: %s", JSON.parse(message));
            console.log('wss clients lenght', Object.keys(WSS_CLIENTS).length);
        });
        // wsSend(JSON.stringify({ type: 'balance', message: 'test' }), ws)


        // users.afterUpdate((user, options) => {
        //     if (WSS_CLIENTS[user.id]) {
        //         if (Object.keys(user._changed).includes('balance')) {
        //             console.log("balance updated by user", user.id);
        //             console.log("trying to send a new balance to user id ", user.id);
        //             try {
        //                 WSS_CLIENTS[user.id].send(
        //                     JSON.stringify({ type: "balance", message: user.balance })
        //                 );
        //                 console.log('balance send to user ', user.id);
        //             } catch {
        //                 console.log(WSS_CLIENTS[user.id], "is empty");
        //             }
        //         }
        //     }
        // });
    });

    return server.listen(port, function () {
        console.log("websocker server is running on port 9191");
    });
}

export const wssSend = (client_id, type, message) => {
    if (client_id) {
        console.log(`Sending message to user[${client_id}] type[${type}]`);
        WSS_CLIENTS[client_id]?.send(
            JSON.stringify({ type: type, message: message })
        );
    }
}

export default wssInit