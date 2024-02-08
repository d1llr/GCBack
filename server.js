const ethers = require("ethers");
const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV.trim()}` });
var sequelize = require("sequelize");
const app = express();

var cron = require("node-cron");
var crypto = require("node:crypto");
const { log } = require("node:console");
const { WebSocketInit, wsSend } = require("./websocketserver");

const WebSocket = require("ws");
const fs = require("node:fs");
var https = require("http");

const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/back.pacgc.pw/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/back.pacgc.pw/cert.pem"),
};

// //create a server object:
// const server = https.createServer(options, function (req, res) {
//   res.write('Hello World!'); //write a response to the client
//   res.end(); //end the response]
//   console.log('started ws server');
// }, app);

// const wss = new WebSocket.Server({ server });

const corsOptions = {
  origin: function (origin, callback) {
    // Проверка, что запрос пришел от разрешенного IP-адреса
    const allowedIps = [
      "https://dev.pacgc.pw",
      "https://pacgc.pw",
      "https://www.pacshooter.pw",
    ]; // замените на разрешенные IP-адреса
    if (!origin || allowedIps.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// database
const db = require("./app/models");
const Role = db.role;
const users = db.user;
const matches = db.matches;
const Tournaments = db.tournaments;
const activeTournaments = db.activeTournaments;
const historyTournaments = db.historyTournaments;

// db.sequelize.sync();
// force: true will drop the table if it already exists
// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Database with { force: true }');
//   initial();
// });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

// expressWs(app)

// app.ws('/', function (ws, req) {
//   ws.on('connection', function (msg) {
//     console.log('ws connected');
//   });
// });

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/games.routes")(app);
require("./app/routes/nft.routes")(app);
require("./app/routes/tournaments.routes")(app);

require("./app/routes/storage.routes")(app);
require("./app/routes/GameServer/user.game.routes")(app);
require("./app/routes/GameServer/game.client.routes")(app);
require("./app/routes/GameServer/match.game.routes")(app);
require("./app/routes/Time/time.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}. | ${process.env.NODE_ENV} |`);
  TournamentsInit();
  // WebSocketInit(app)
});

const server = https.createServer(options, function (req, res) {
  res.write("Hello World!"); //write a response to the client
  res.end(); //end the response]
  console.log("started ws server");
});

var wss = new WebSocket.Server({ server });
var WSS_CLIENTS = {};

wss.on("connection", async (ws) => {
  ws.send(
    JSON.stringify({ type: "connect", message: "wss connection successful" })
  );
  ws.on("message", function incoming(message) {
    const msg = JSON.parse(message);
    switch (msg.type) {
      case "auth":
        WSS_CLIENTS[msg.message] = ws;
        break;

      default:
        break;
    }
    console.log("received: %s", JSON.parse(message));
  });
  console.log("got new wss connection");
  // wsSend(JSON.stringify({ type: 'balance', message: 'test' }), ws)
  users.afterUpdate((user, options) => {
    console.log("balance updated by user", user.id);
    console.log("send a new balance to user id ", user.id);
    WSS_CLIENTS[user.id].send(
      JSON.stringify({ type: "balance", message: user.balance })
    );
  });
});
// console.log(WSS_CLIENTS);
// cron.schedule(`*/3 * * * * *`, function () {
//   initial()
// }, {
//   timezone: "Europe/Moscow"
// });

server.listen(7070, function () {
  console.log("Server is running on port 7070");
});

// export const wsSend = function (data) {
//   // readyState - true, если есть подключение
//   if (!wsConnection.readyState) {
//     setTimeout(function () {
//       wsSend(data);
//     }, 100);
//   } else {
//     wsConnection.send(data);
//   }
// };

// server.listen(7070, function () {
//   console.log('Server is running on port 7070');
// });

function initial() {
  users
    .findOne({
      where: {
        id: 1,
      },
    })
    .then((user) => {
      user.update({
        balance: user.balance - 1,
      });
    });
  // Role.create({
  //   id: 1,
  //   name: "user"
  // });

  // Role.create({
  //   id: 2,
  //   name: "moderator"
  // });

  // Role.create({
  //   id: 3,
  //   name: "admin"
  // });
}

// wss.on('connection', (ws) => {
//   ws.on('message', function incoming(message) {
//     console.log('received: %s', JSON.parse(message));
//   });

//   users.afterBulkUpdate((user, options) => {
//     console.log('balance updated');
//     ws.send(JSON.stringify({ type: 'balance', message: user.balance }));
//   });
//   // cron.schedule(`*/3 * * * * *`, function () {
//   //   initial()
//   // }, {
//   //   timezone: "Europe/Moscow"
//   // });
// })

const sendETH = async (privateKey, provider, amountToSend, toAddress) => {
  if (
    amountToSend.toString() === "0" ||
    amountToSend.toString() === "0.0" ||
    amountToSend.toString() === "0,0"
  ) {
    return;
  }

  // Creating a wallet provider with your private key
  const wallet = new ethers.Wallet(privateKey, provider);

  // Creating a transaction object
  const tx = {
    to: toAddress,
    value: amountToSend,
    gasPrice: constants.Zero,
    gasLimit: constants.Zero,
  };

  // Estimating gas for the transaction
  const gasEstimate = await wallet.estimateGas(tx);

  // Setting custom gas values
  const gasPrice = ethers.utils.parseUnits("20", "gwei"); // Setting gas price in gwei
  const gasLimit = gasEstimate.mul(2); // Setting gas limit to twice the estimation

  // Adding custom gas values to the transaction object
  tx.gasPrice = gasPrice;
  tx.gasLimit = gasLimit;

  // Signing and sending the transaction
  const txReceipt = await wallet.sendTransaction(tx);
  await provider.waitForTransaction(txReceipt.hash).then((receipt) => {
    console.log("Transaction Confirmed: " + receipt.status);
  });

  console.log("Transaction hash:", txReceipt.hash);
};

async function TournamentsInit() {
  console.log("-------- INIT TOUTNAMENTS --------");
  console.log("Finding not disabled tournaments...");
  const getWinners = (tour) => {
    var result = {};
    var resp = [];
    tour.players.split(",")?.forEach((user) => {
      result[user] = 0;
    });
    matches
      .findAll({
        where: {
          tournament_key: tour.tournament_key,
        },
      })
      .then(async (matches) => {
        matches.forEach(async (match) => {
          match.tournament_participants
            .split(",")
            ?.forEach((match_participants) => {
              if (match_participants == match.winner_id) {
                result[match_participants] += match.match_cost;
              } else {
                result[match_participants] -= match.match_cost;
              }
            });
        });

        var tuples = [];
        for (var key in result) tuples.push([key, result[key]]);
        tuples.sort(function (a, b) {
          a = a[1];
          b = b[1];
          return a > b ? -1 : a < b ? 1 : 0;
        });

        const findUserName = async (id) => {
          try {
            const founded_user = await users.findOne({
              where: {
                id: id,
              },
            });
            return founded_user.wallet;
          } catch (err) {
            console.log(err);
          }
        };
        for (var i = 0; i < tuples.length; i++) {
          var key = tuples[i][0];
          var value = tuples[i][1];
          var prize = "";
          switch (i) {
            case 0:
              prize = 40;
              break;
            case 1:
              prize = 30;
              break;
            case 2:
              prize = 10;
              break;

            default:
              break;
          }
          resp.push({
            wallet: await findUserName(key),
            prize: prize,
          });
        }
        // tuples.map(async item => {
        //   await users.findOne({
        //     where: {
        //       id: item[0],
        //     }
        //   }).then(_usert => resp += {
        //     _usert: item[1]
        //   })
        // })
        // возможно нужно будет

        console.log(resp);
        return resp;
      })
      .catch((err) => {
        console.log(err);
        return err;
      });
  };
  Tournaments.findAll({
    where: {
      disabled: false,
    },
  }).then((tournaments) => {
    console.log(`Founded ${tournaments.length} not disabled tournaments`);
    tournaments.forEach((tournament) => {
      console.log(
        `"${tournament.name} ${tournament.id}" tournaments will start every ${tournament.dayOfWeekFrom}!`
      );
      // Запуск турнира
      cron.schedule(
        `34 18 * * monday`,
        function () {
          console.log(`"${tournament.name}" tournaments created!`);
          historyTournaments
            .findOne({
              attributes: [
                [sequelize.fn("COUNT", sequelize.col("name")), "count_names"],
              ],
              where: {
                name: tournament.name,
              },
            })
            .then((hist_founded) => {
              console.log("founded ", hist_founded.dataValues.count_names);
              activeTournaments.create({
                image: tournament.dataValues.image,
                disabled: tournament.dataValues.disabled,
                name: tournament.dataValues.name,
                description: tournament.dataValues.description,
                daysLeft: tournament.dataValues.daysLeft,
                id:
                  tournament.dataValues.id +
                  hist_founded.dataValues.count_names,
                cost: tournament.dataValues.cost,
                game: tournament.dataValues.game,
                dayOfWeekFrom: tournament.dataValues.dayOfWeekFrom,
                dayOfWeekTo: tournament.dataValues.dayOfWeekTo,
                goal: tournament.dataValues.goal,
                participants: 0,
                bank: tournament.dataValues.bank,
                tournament_key: crypto.randomBytes(10).toString("hex"),
              });
            });
          // Создание в определенный день активного турнира
        },
        {
          timezone: "Europe/Moscow",
        }
      );
      console.log(
        `"${tournament.name} ${tournament.id}" tournaments will end on next ${tournament.dayOfWeekTo}!`
      );

      // Завершение активного турнира ${tournament.dayOfWeekTo}
      cron.schedule(
        `00 18 * * monday`,
        function () {
          activeTournaments
            .findOne({
              where: {
                name: tournament.dataValues.name,
              },
            })
            .then(async (tour) => {
              console.log(tour.dataValues.image);
              await historyTournaments
                .create({
                  image: tour.dataValues.image,
                  disabled: tour.dataValues.disabled,
                  name: tour.dataValues.name,
                  description: tour.dataValues.description,
                  id: tour.dataValues.id,
                  daysLeft: tour.dataValues.daysLeft,
                  players: tour.dataValues.players,
                  cost: tour.dataValues.cost,
                  game: tour.dataValues.game,
                  dayOfWeekFrom: tour.dataValues.dayOfWeekFrom,
                  dayOfWeekTo: tour.dataValues.dayOfWeekTo,
                  goal: tour.dataValues.goal,
                  participants: tour.dataValues.participants,
                  bank: tour.dataValues.bank,
                  tournament_key: tour.dataValues.tournament_key,
                })
                .then(async () => {
                  activeTournaments.destroy({
                    where: {
                      id: tour.dataValues.id,
                    },
                  });
                  console.log(
                    `"${tournament.name} ${tournament.id}" tournaments deleted from active tournaments!`
                  );

                  const winners = getWinners(tour);
                  console.log(
                    `Tournament ${tour.dataValues.name} winners: ${winners}`
                  );

                  for (let i = 0; i < winners.length; i++) {
                    const provider = new ethers.providers.JsonRpcProvider(
                      "https://rpc.octa.space"
                    );
                    await sendETH(
                      "0xbb376ad6ef7512dce7f728465c43d8d65ebbfc1d8a3a8dcfeabc0be13e157972", // make as process.env.TOURNAMENT_PK
                      provider,
                      ethers.utils.parseEther(winners[i].prize.toString()),
                      winners[i].wallet.toString()
                    );
                  }
                });
            });
          console.log(`"${tournament.name}" tournaments ended!`);
        },
        {
          timezone: "Europe/Moscow",
        }
      );
    });
  });
}
// cron.schedule("*/10 * * * * *", function() {
//   console.log("running a task every 10 second");
// });
