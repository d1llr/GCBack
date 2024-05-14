import { Wallet, constants as _constants, utils, providers } from "ethers";
import express, { json, urlencoded } from "express";
import cors from "cors";
import cron from 'node-cron'
import constants from "constants";

import db from "./app/models/index.js";
const app = express();

// const { WebSocketInit, wsSend } = require("./websocketserver");

// const WebSocket = require("ws");
// const fs = require("node:fs");
// var https = require("http");
import './app/utils/redis.js';
import { InitListeners } from './app/listeners/listeners.js';
import wssInit from "./app/utils/wss.js";
// const options = {
//   key: fs.readFileSync("/etc/letsencrypt/live/back.pacgc.pw/privkey.pem"),
//   cert: fs.readFileSync("/etc/letsencrypt/live/back.pacgc.pw/cert.pem"),
// };

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
      'http://localhost:4173',
      "https://pacmatch.org",
      "https://pacmatch.org",
      'https://pacmanwars.pw',
      'https://dev.pacmanwars.pw',
      'https://pacball.io'
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
app.use(json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(urlencoded({ extended: true }));

// databas

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
const { levels: levels, user: users, tournamentsLevel: tournamentsLevel } = db




// expressWs(app)

// app.ws('/', function (ws, req) {
//   ws.on('connection', function (msg) {
//     console.log('ws connected');
//   });
// });

// routes
// expressWs(app)
// app.ws('/', function (ws, req) {
//   ws.on('connection', function (msg) {
//     console.log('ws connected');
//   });
// });
// routes
import Auth from "./app/routes/auth.routes.js"
Auth(app)
import User from "./app/routes/user.routes.js"
User(app)
import Games from './app/routes/games.routes.js'
Games(app)
import NFTS from './app/routes/nft.routes.js'
NFTS(app)
import Tournaments from './app/routes/tournaments.routes.js'
Tournaments(app)
import Storage from './app/routes/storage.routes.js'
Storage(app)
import UserGames from './app/routes/GameServer/user.game.routes.js'
UserGames(app)
import GameClientRoutes from './app/routes/GameServer/game.client.routes.js'
GameClientRoutes(app)
import MatchGameRoutes from './app/routes/GameServer/match.game.routes.js'
MatchGameRoutes(app)
import TimeRoutes from './app/routes/Time/time.routes.js'
TimeRoutes(app)
import OtherRoutes from './app/routes/Time/other.routes.js'
OtherRoutes(app)



// set port, listen for requests
const PORT = process.env.EXPRESS_PORT || 9091;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}. | ${process.env.NODE_ENV} |`);
  InitListeners()
  wssInit(7070)
  TournamentsInit()
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
  const wallet = new Wallet(privateKey, provider);
  // Creating a transaction object
  const tx = {
    to: toAddress,
    value: amountToSend,
    gasPrice: _constants.Zero,
    gasLimit: _constants.Zero,
  };

  // Estimating gas for the transaction
  const gasEstimate = await wallet.estimateGas(tx);

  // Setting custom gas values
  const gasPrice = utils.parseUnits("20", "gwei"); // Setting gas price in gwei
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

const { Tournaments: tournaments, activeTournaments: activeTournaments, historyTournaments: historyTournaments, purchases: purchases } = db;
console.log(tournaments);

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
      tournamentsLevel.findAll({
        where: {
          tournament_key: tour.tournament_key,
        },
      })
        .then(async (levels_arr) => {
          levels_arr.forEach(async level => {
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
                  prize = 15;
                  break;
                case 3:
                  prize = 10;
                  break;
                case 4:
                  prize = 5;
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
  tournaments.findAll({
    where: {
      disabled: false,
    },
  }).then((tournaments) => {
    console.log(`Founded ${tournaments.length} not disabled tournaments`);
    tournaments.forEach(async (tournament) => {
      // console.log(
      //   `"${tournament.name} by ${tournament.id}" tournaments will start every ${tournament.dayOfWeekFrom}!`
      // );
      // Запуск турнира
      // schedule(
      //   `59 13 * * ${tournament.dayOfWeekFrom}`,

      //   function () {
      //     console.log(`"${tournament.name}" tournaments created!`);
      //     historyTournaments
      //       .findOne({
      //         attributes: [
      //           [fn("COUNT", col("name")), "count_names"],
      //         ],
      //         where: {
      //           name: tournament.name,
      //         },
      //       })
      //       .then((hist_founded) => {
      //         activeTournaments.create({
      //           image: tournament.dataValues.image,
      //           disabled: tournament.dataValues.disabled,
      //           name: tournament.dataValues.name,
      //           description: tournament.dataValues.description,
      //           daysLeft: tournament.dataValues.daysLeft,
      //           id: 1 + Number(hist_founded.dataValues.count_names),
      //           cost: tournament.dataValues.cost,
      //           address: tournament.dataValues.address,
      //           chainID: tournament.dataValues.chainID,
      //           map: tournament.dataValues.map,
      //           game: tournament.dataValues.game,
      //           game_name: tournament.dataValues.game_name,
      //           dayOfWeekFrom: tournament.dataValues.dayOfWeekFrom,
      //           dayOfWeekTo: tournament.dataValues.dayOfWeekTo,
      //           goal: tournament.dataValues.goal,
      //           participants: 0,
      //           awards: tournament.dataValues.awards,
      //           bank: tournament.dataValues.bank,
      //           tournament_key: randomBytes(10).toString("hex"),
      //         });
      //       });
      //     // Создание в определенный день активного турнира
      //   },
      //   {
      //     timezone: "Europe/Moscow",
      //   }
      // );
      // console.log(
      //   `"${tournament.name} by ${tournament.id}" tournaments will end on next ${tournament.dayOfWeekTo}!`
      // );

      // Завершение активного турнира ${tournament.dayOfWeekTo}
      cron.schedule(
        `54 20 * * Thursday`,
        async function () {
          console.log('Завершение активного турнира');
          await activeTournaments.findOne({
            where: {
              name: tournament.dataValues.name,
            },
          })
            .then(async (tour) => {
              getWinners(tour).then(async (value) => {
                console.log(value.length);
                console.log(
                  `Tournament ${tour.dataValues.name} winners: ${utils.parseEther(value[0].prize.toString())}`
                );

                for (let i = 0; i < value.length; i++) {
                  const provider = new providers.JsonRpcProvider(
                    "https://rpc.octa.space"
                  );
                  await sendETH(
                    "0xeb87b63e7d60ec0d5aa09b4739647eb3bd19ca60999ce14b7f96deaa9e5d8564", // make as process.env.TOURNAMENT_PK
                    provider,
                    utils.parseEther(value[i].prize.toString()),
                    value[i].wallet.toString()
                  );
                }
              });
              // historyTournaments.create({
              //   image: tour.dataValues.image,
              //   disabled: tour.dataValues.disabled,
              //   name: tour.dataValues.name,
              //   description: tour.dataValues.description,
              //   id: tour.dataValues.id,
              //   daysLeft: tour.dataValues.daysLeft,
              //   players: tour.dataValues.players,
              //   cost: tour.dataValues.cost,
              //   game: tour.dataValues.game,
              //   game_name: tour.dataValues.game_name,
              //   map: tour.dataValues.map,
              //   address: tour.dataValues.address,
              //   awards: tour.dataValues.awards,
              //   chainID: tour.dataValues.chainID,
              //   dayOfWeekFrom: tour.dataValues.dayOfWeekFrom,
              //   dayOfWeekTo: tour.dataValues.dayOfWeekTo,
              //   goal: tour.dataValues.goal,
              //   participants: tour.dataValues.participants,
              //   bank: tour.dataValues.bank,
              //   tournament_key: tour.dataValues.tournament_key,
              //   createdAt: new Date()
              // })
              //   .then(async () => {
              //     // activeTournaments.destroy({
              //     //   where: {
              //     //     id: tour.dataValues.id,
              //     //   },
              //     // });
              //     console.log(
              //       `"${tournament.name} ${tournament.id}" tournaments deleted from active tournaments!`
              //     );

              //     getWinners(tour).then(async (value) => {
              //       console.log(value.length);
              //       console.log(
              //         `Tournament ${tour.dataValues.name} winners: ${utils.parseEther(value[0].prize.toString())}`
              //       );

              //       for (let i = 0; i < value.length; i++) {
              //         const provider = new providers.JsonRpcProvider(
              //           "https://rpc.octa.space"
              //         );
              //         await sendETH(
              //           "0xeb87b63e7d60ec0d5aa09b4739647eb3bd19ca60999ce14b7f96deaa9e5d8564", // make as process.env.TOURNAMENT_PK
              //           provider,
              //           utils.parseEther(value[i].prize.toString()),
              //           value[i].wallet.toString()
              //         );
              //       }
              //     });
              //   }).catch(err => {
              //     console.log(err);
              //   })
            }).catch(err => {
              console.log(err);
            })
          console.log(`"${tournament.name}" tournaments ended!`);
        },
        {
          timezone: "Europe/Moscow",
        }
      );
    });
  });
}