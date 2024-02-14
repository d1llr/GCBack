const e = require("express");
const db = require("../models");
const { sendMessage } = require("../../websocketserver");
const { tournaments: tournaments, activeTournaments: activeTournaments, historyTournaments: historyTournaments, user: users, matches: matches, levels: levels } = db;
const Op = db.Sequelize.Op;

exports.getAll = (req, res) => {
  try {
    activeTournaments.findAll().then(tournament => {
      res.send(tournament);
    });
  }
  catch {
    res.status(500).send({ message: err.message });
  };
};

exports.getHistory = (req, res) => {
  try {
    historyTournaments.findAll().then(tournament => {
      res.send(tournament);
    });
  }
  catch {
    res.status(500).send({ message: err.message });
  };
};

exports.getById = (req, res) => {
  console.log(req.params["tournamentId"]);
  try {
    activeTournaments.findOne({
      where: {
        id: Number(req.params["tournamentId"]),
        disabled: false
      }
    }).then(tournament => {
      if (tournament)
        res.status(200).send(tournament);
      else
        res.status(404).send('not found!');

    })
      .catch(() => {
        res.status(404).send('not found!');

      })
  }
  catch {
    res.status(500).send({ message: 'tournamentId не существует' });
  };
};

exports.getByIdFromHistory = (req, res) => {
  try {
    historyTournaments.findOne({
      where: {
        id: req.params["tournamentId"],
        disabled: false
      }
    }).then(tournament => {
      res.status(200).send(tournament);
    })
  }
  catch {
    res.status(500).send({ message: 'tournamentId не существует' });
  };
};

// Участие в активном турнире
exports.getParticipate = (req, res) => {
  try {
    activeTournaments.findByPk(Number(req.body.tournament_id))
      .then((founded) => {
        let arr
        if (founded.players) {
          arr = founded.players.split(',');
          if (!arr.includes(req.body.user_id.toString())) {
            arr.push(req.body.user_id.toString())
          }
        }
        else {
          arr = [req.body.user_id.toString()]
        }
        users.findOne({
          where: {
            id: req.body.user_id.toString()
          }
        }).then(async user => {
          // await user.update({
          //   balance: user.balance - founded.cost
          // }).then(() => {
            // function initial() {
            //   users.findOne({
            //     where: {
            //       id: 1
            //     }

            //   }).then(user => {
            //     user.update({
            //       balance: user.balance - 1
            //     })
            //   })
            //   // Role.create({
            //   //   id: 1,
            //   //   name: "user"
            //   // });

            //   // Role.create({
            //   //   id: 2,
            //   //   name: "moderator"
            //   // });

            //   // Role.create({
            //   //   id: 3,
            //   //   name: "admin"
            //   // });
            // }
            // var cron = require('node-cron');
            // cron.schedule(`*/3 * * * * *`, function () {
            //   initial()
            // }, {
            //   timezone: "Europe/Moscow"
            // });
          // })
          // users.afterBulkUpdate(user => {
          //   console.log('user updated');
          //   sendMessage(user.balance)
          // })
        })
        founded.increment('participants', {
          by: 1
        })
        founded.update({
          players: arr.join(',')
        }).then(tournament => {
          res.status(200).send({ message: 'Participate successful' });
        })
          .catch((err) => {
            console.log(err);
          })
      })
      .catch(() => {
        res.status(404).send('Not found!');
      })
  }
  catch {
    res.status(500).send({ message: 'tournamentId не существует' });
  };
};

exports.getRating = (req, res) => {
  var result = {}
  var resp = []
  switch (req.body.type) {
    case 'history':
      historyTournaments.findOne({
        where: {
          id: Number(req.body.tournament_id)
        }
      })
        .then((founded) => {
          console.log(founded);
          founded.players.split(',')?.forEach(user => {
            result[user] = 0
          })
          switch (founded.game) {
            case 'PAC_SHOOT':
              matches.findAll({
                where: {
                  tournament_key: founded.tournament_key
                }
              }).then(async matches => {
                matches.forEach(async match => {
                  match.tournament_participants.split(',')?.forEach(match_participants => {
                    if (match_participants == match.winner_id) {
                      result[match_participants] += match.match_cost
                    }
                    else {
                      result[match_participants] -= match.match_cost
                    }
                  })
                });

                var tuples = [];
                for (var key in result) tuples.push([key, result[key]]);
                tuples.sort(function (a, b) {
                  a = a[1];
                  b = b[1];
                  return a > b ? -1 : (a < b ? 1 : 0);
                });

                const findUserName = async (id) => {
                  try {
                    const founded_user = await users.findOne({
                      where: {
                        id: id
                      }
                    });
                    return founded_user.username;
                  } catch (err) {
                    console.log(err);
                  }
                };
                for (var i = 0; i < tuples.length; i++) {
                  var key = tuples[i][0];
                  var value = tuples[i][1];
                  resp.push({
                    username: await findUserName(key),
                    earned: value
                  })
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

                res.status(200).json(resp);

              }).catch((err) => {
                console.log(err);
                res.status(404).send('Not found!');
              })
              break;
            case '3inRow':
              levels.findAll({
                where: {
                  tournament_key: founded.tournament_key
                }
              }).then(async levels_founded => {
                levels_founded.forEach(async level => {
                  if (level.isWin && level.tournament_participants != null) {
                    result[level.tournament_participants] += level.win_cost
                  }
                  else {
                    result[level.tournament_participants] -= level.lose_cost
                  }


                });


                const getGamesCount = async (user_id) => {
                  const { count, rows } = await levels.findAndCountAll({
                    where: {
                      tournament_participants: user_id
                    }
                  })
                  return count
                }

                let test = [['9', -11, 14], ['1', 10, 70], ['2', 30, 20], ['3', 30, 30], ['4', 30, 50]]
                var tuples = [];
                for (var key in result) tuples.push([key, result[key], await getGamesCount(key) ]);
                tuples.sort(function (a, b) {
              
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
                    else  {
                      return 0
                    }
                    // return 0

                  }
                });
                
                const findUserName = async (id) => {
                  try {
                    const founded_user = await users.findOne({
                      where: {
                        id: id
                      }
                    });
                    return founded_user.username;
                  } catch (err) {
                    console.log(err);
                  }
                };
                for (var i = 0; i < tuples.length; i++) {
                  var key = tuples[i][0];
                  var value = tuples[i][1];
                  var games_count = tuples[i][2];
                  console.log(tuples);
                  resp.push({
                    username: await findUserName(key),
                    earned: value >= 0 ? value : 0,
                    games_count: games_count
                  })
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

                res.status(200).json(resp);

              }).catch((err) => {
                console.log(err);
                res.status(404).send('Not found!');
              })

              break;

            default:
              break;
          }
          // matches.findAll({
          //   where: {
          //     tournament_key: founded.tournament_key
          //   }
          // }).then(async matches => {
          //   matches.forEach(async match => {
          //     match.tournament_participants.split(',')?.forEach(match_participants => {
          //       if (match_participants == match.winner_id) {
          //         result[match_participants] += match.match_cost
          //       }
          //       else {
          //         result[match_participants] -= match.match_cost
          //       }
          //     })
          //   });

          //   var tuples = [];
          //   for (var key in result) tuples.push([key, result[key]]);
          //   tuples.sort(function (a, b) {
          //     a = a[1];
          //     b = b[1];
          //     return a > b ? -1 : (a < b ? 1 : 0);
          //   });

          //   const findUserName = async (id) => {
          //     try {
          //       const founded_user = await users.findOne({
          //         where: {
          //           id: id
          //         }
          //       });
          //       return founded_user.username;
          //     } catch (err) {
          //       console.log(err);
          //     }
          //   };
          //   for (var i = 0; i < tuples.length; i++) {
          //     var key = tuples[i][0];
          //     var value = tuples[i][1];
          //     resp.push({
          //       username: await findUserName(key),
          //       earned: value
          //     })
          //   }
          //   // tuples.map(async item => {
          //   //   await users.findOne({
          //   //     where: {
          //   //       id: item[0],
          //   //     }
          //   //   }).then(_usert => resp += {
          //   //     _usert: item[1]
          //   //   })
          //   // })
          //   // возможно нужно будет

          //   console.log(resp);
          //   res.status(200).json(resp);

          // }).catch((err) => {
          //   console.log(err);
          //   res.status(404).send('Not found!');
          // })
        })
        .catch((err) => {
          console.log(err);
          res.status(404).send('Not found!');
        })
      break;
    case 'active':
      activeTournaments.findOne({
        where: {
          id: Number(req.body.tournament_id)
        }
      })
        .then((founded) => {
          founded.players.split(',')?.forEach(user => {
            result[user] = 0
          })
          switch (founded.game) {
            case 'PAC_SHOOT':
              matches.findAll({
                where: {
                  tournament_key: founded.tournament_key
                }
              }).then(async matches => {
                matches.forEach(async match => {
                  match.tournament_participants.split(',')?.forEach(match_participants => {
                    if (match_participants == match.winner_id) {
                      result[match_participants] += match.match_cost
                    }
                    else {
                      result[match_participants] -= match.match_cost
                    }
                  })
                });

                var tuples = [];
                for (var key in result) tuples.push([key, result[key]]);
                tuples.sort(function (a, b) {
                  a = a[1];
                  b = b[1];
                  return a > b ? -1 : (a < b ? 1 : 0);
                });

                const findUserName = async (id) => {
                  try {
                    const founded_user = await users.findOne({
                      where: {
                        id: id
                      }
                    });
                    return founded_user.username;
                  } catch (err) {
                    console.log(err);
                  }
                };
                for (var i = 0; i < tuples.length; i++) {
                  var key = tuples[i][0];
                  var value = tuples[i][1];
                  resp.push({
                    username: await findUserName(key),
                    earned: value
                  })
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

                res.status(200).json(resp);

              }).catch((err) => {
                console.log(err);
                res.status(404).send('Not found!');
              })
              break;
            case '3inRow':
              levels.findAll({
                where: {
                  tournament_key: founded.tournament_key
                }
              }).then(async levels_founded => {
                levels_founded.forEach(async level => {
                  if (level.isWin && level.tournament_participants != null) {
                    result[level.tournament_participants] += level.win_cost
                  }
                  else {
                    result[level.tournament_participants] -= level.lose_cost
                  }


                });


                const getGamesCount = async (user_id) => {
                  const { count, rows } = await levels.findAndCountAll({
                    where: {
                      tournament_participants: user_id,
                      tournament_key: founded.tournament_key
                    }
                  })
                  return count
                }

                let test = [['9', -11, 14], ['1', 10, 70], ['2', 30, 20], ['3', 30, 30], ['4', 30, 50]]
                var tuples = [];
                for (var key in result) tuples.push([key, result[key], await getGamesCount(key) ]);
                tuples.sort(function (a, b) {
              
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
                    else  {
                      return 0
                    }
                    // return 0

                  }
                });
                
                const findUserName = async (id) => {
                  try {
                    const founded_user = await users.findOne({
                      where: {
                        id: id
                      }
                    });
                    return founded_user.username;
                  } catch (err) {
                    console.log(err);
                  }
                };
                for (var i = 0; i < tuples.length; i++) {
                  var key = tuples[i][0];
                  var value = tuples[i][1];
                  var games_count = tuples[i][2];
                  console.log(tuples);
                  resp.push({
                    username: await findUserName(key),
                    earned: value >= 0 ? value : 0,
                    games_count: games_count
                  })
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

                res.status(200).json(resp);

              }).catch((err) => {
                console.log(err);
                res.status(404).send('Not found!');
              })

              break;

            default:
              break;
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(404).send('Not found!');
        })
      break;
  }
};


