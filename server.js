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

require('./app/utils/redis')

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
      'http://localhost:4173',
      "https://pacmatch.org",
      "https://pacmatch.org",
      'https://pacmanwars.pw'
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
const { resolve } = require("node:path");
const Role = db.role;
const users = db.user;
const levels = db.levels;
const matches = db.matches;
const Tournaments = db.tournaments;
const activeTournaments = db.activeTournaments;
const historyTournaments = db.historyTournaments;
const purchases = db.purchases;

db.sequelize.sync();
// force: true will drop the table if it already exists
// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Database with { force: true }');
//   initial();
// });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to @rmadidntwakeup application." });
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
const PORT = process.env.PORT || 9090;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}. | ${process.env.NODE_ENV} |`);
  TournamentsInit();

});

const server = https.createServer(options, function (req, res) {
  res.write("Hello World!"); //write a response to the client
  res.end(); //end the response]
  console.log("started ws server");
});

var wss = new WebSocket.Server({ server });
var WSS_CLIENTS = {};

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
  users.afterUpdate((user, options) => {
    if (WSS_CLIENTS[user.id]) {
      console.log("balance updated by user", user.id);
      console.log("trying to send a new balance to user id ", user.id);
      try {
        WSS_CLIENTS[user.id].send(
          JSON.stringify({ type: "balance", message: user.balance })
        );
        console.log('balance send to user ', user.id);
      } catch {
        console.log(WSS_CLIENTS[user.id], "is empty");
      }
    }
  });
});

server.listen(9191, function () {
  console.log("websocker server is running on port 9191");
});


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

  const constants = require("constants");
  // Creating a transaction object
  const tx = {
    to: toAddress,
    value: amountToSend,
    gasPrice: ethers.constants.Zero,
    gasLimit: ethers.constants.Zero,
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
    return new Promise((resolve) => {
      var result = {};
      var resp = [];
      tour.players.split(",")?.forEach((user) => {
        result[user] = 0;
      });
      db.tournamentsLevel
        .findAll({
          where: {
            tournament_key: tour.tournament_key,
          },
        })
        .then(async (levels_arr) => {
          await levels_arr.forEach(async level => {
            if (level.isWin && level.player_ID != null) {
              result[level.player_ID] += level.win_cost
            }
            else {
              result[level.player_ID] -= level.lose_cost
            }
          });

          const getGamesCount = async (user_id) => {
            const { count, rows } = await levels.findAndCountAll({
              where: {
                player_ID: user_id
              }
            })
            return count
          }

          var tuples = [];
          for (var key in result) tuples.push([key, result[key], await getGamesCount(key)]);
          var purchases_arr
          tuples.forEach(async (user) => {
            purchases_arr = await purchases.findAll({
              where: {
                user_id: user[0],
                game: tour.game,
                tournament_key: tour.tournament_key
              }
            }).then((purchases_arr) => {
              purchases_arr.forEach(async (purchase) => {
                return user[1] -= Number(purchase.cost);
              });
            })
          })
          const sort = (tuples) => {
            return tuples.sort(function (a, b) {
              if (a[1] > b[1]) {
                return -1
              }
              else if (a[1] < b[1]) {
                return 1
              }
              else {
                if (a[2] > b[2]) {
                  return -1
                }
                else {
                  return 0
                }
              }
            })
          }
          setTimeout(async () => {
            sort(tuples)
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
              var prize = 0;
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
            resolve(resp);
          }, 2000);
        })
        .catch((err) => {
          console.log(err);
          return err;
        });
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
        `"${tournament.name} by ${tournament.id}" tournaments will start every ${tournament.dayOfWeekFrom}!`
      );
      // Запуск турнира
      cron.schedule(
        `55 14 * * ${tournament.dayOfWeekFrom}`,

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
              activeTournaments.create({
                image: tournament.dataValues.image,
                disabled: tournament.dataValues.disabled,
                name: tournament.dataValues.name,
                description: tournament.dataValues.description,
                daysLeft: tournament.dataValues.daysLeft,
                id: 1 + Number(hist_founded.dataValues.count_names),
                cost: tournament.dataValues.cost,
                address: tournament.dataValues.address,
                chainID: tournament.dataValues.chainID,
                map: tournament.dataValues.map,
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
        `"${tournament.name} by ${tournament.id}" tournaments will end on next ${tournament.dayOfWeekTo}!`
      );

      // Завершение активного турнира ${tournament.dayOfWeekTo}
      cron.schedule(
        `07 11 * * ${tournament.dayOfWeekTo}`,
        async function () {
          console.log('Завершение активного турнира');
          await activeTournaments
            .findOne({
              where: {
                name: tournament.dataValues.name,
              },
            })
            .then(async (tour) => {
              historyTournaments.create({
                image: tour.dataValues.image,
                disabled: tour.dataValues.disabled,
                name: tour.dataValues.name,
                description: tour.dataValues.description,
                id: tour.dataValues.id,
                daysLeft: tour.dataValues.daysLeft,
                players: tour.dataValues.players,
                cost: tour.dataValues.cost,
                game: tour.dataValues.game,
                map: tour.dataValues.map,
                address: tour.dataValues.address,
                chainID: tour.dataValues.chainID,
                dayOfWeekFrom: tour.dataValues.dayOfWeekFrom,
                dayOfWeekTo: tour.dataValues.dayOfWeekTo,
                goal: tour.dataValues.goal,
                participants: tour.dataValues.participants,
                bank: tour.dataValues.bank,
                tournament_key: tour.dataValues.tournament_key,
                createdAt: new Date()
              })
                .then(async () => {
                  // activeTournaments.destroy({
                  //   where: {
                  //     id: tour.dataValues.id,
                  //   },
                  // });
                  // console.log(
                  //   `"${tournament.name} ${tournament.id}" tournaments deleted from active tournaments!`
                  // );

                  getWinners(tour).then(async (value) => {
                    console.log(value.length);
                    console.log(
                      `Tournament ${tour.dataValues.name} winners: ${ethers.utils.parseEther(value[0].prize.toString())}`
                    );

                    for (let i = 0; i < value.length; i++) {
                      const provider = new ethers.providers.JsonRpcProvider(
                        "https://rpc.octa.space"
                      );
                      await sendETH(
                        "0xeb87b63e7d60ec0d5aa09b4739647eb3bd19ca60999ce14b7f96deaa9e5d8564", // make as process.env.TOURNAMENT_PK
                        provider,
                        ethers.utils.parseEther(value[i].prize.toString()),
                        value[i].wallet.toString()
                      );
                    }
                  });
                }).catch(err => {
                  console.log(err);
                })
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
