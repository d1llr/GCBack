const e = require("express");
const db = require("../models").default;
const { logger } = require("ethers");
const { tournaments: tournaments, activeTournaments: activeTournaments, historyTournaments: historyTournaments, user: users, matches: matches, levels: levels, purchases: purchases, tournamentsLevel: tournamentsLevel } = db;
const Op = db.Sequelize.Op;

exports.getAll = async (req, res) => {
  try {
    let arr = []
    await activeTournaments.findAll().then(tournament => {
      arr.push({ 'active': tournament })
    });
    await historyTournaments.findAll().then(tournament => {
      arr.push({ 'history': tournament })
    });
    console.log(req.body.offset, req.body.offset + req.body.limit);
    await res.status(200).json(arr.slice(req.body.offset, req.body.offset + req.body.limit));
  }
  catch {
    res.status(500).send({ message: err.message });
  };
};

exports.getTournamentsByFilters = async (req, res) => {
  try {
    let arr = []
    let active = []
    let history = []
    await activeTournaments.findAll().then(tournament => {
      active = tournament
    });
    await historyTournaments.findAll().then(tournament => {
      history = tournament
    });

    Object.values(req.body).map()
    console.log(active);
    await res.status(200).json({ active: active, history: history });
  }
  catch {
    res.status(500).send({ message: " " });
  };
};

exports.getAllByGame = (req, res) => {
  console.log(req.body.game);
  try {
    activeTournaments.findAll({
      attributes: ['name', 'players', 'tournament_key'],
      where: {
        game: req.params['game']
      }
    }).then(tournaments => {
      res.send({ tournaments: tournaments });
    });
  }
  catch {
    res.status(500).send({ message: err.message });
  };
};

exports.getFilters = async (req, res) => {
  const arr = []
  try {
    await activeTournaments.findAll({
      attributes: ['chainID', 'game_name']
    }).then(tournaments => {
      arr.push({ ...tournaments, type: 'active' })
    })
    await historyTournaments.findAll({
      attributes: ['chainID', 'game_name']
    }).then(tournaments => {
      arr.push({ ...tournaments, type: 'ended' })
    })


    res.status(200).send(arr);

  }
  catch {
    res.status(500).send({ message: 'Error' });
  };
};

exports.GetTournamentsCount = async (req, res) => {
  const arr = []
  try {
    const { count, rows } = await activeTournaments.findAndCountAll()
    const { count: historyCount, historyRows } = await historyTournaments.findAndCountAll()
    console.log("activeCount", count);
    res.status(200).json(count + historyCount)

  }
  catch {
    res.status(500).send({ message: 'Error' });
  };
};

exports.getAllActiveAndHistoryTournaments = async (req, res) => {
  const response = {
    active: {},
    history: {}
  }
  try {
    await activeTournaments.findAll({
      attributes: ['name', 'goal', 'game_name', 'daysLeft', 'cost', 'id'],
      where: {
        game: req.params['game']
      }
    }).then(tournaments => {
      response.active = tournaments
    });
    // --------------------------- //
    await historyTournaments.findAll({
      attributes: ['name', 'id', 'game_name', 'createdAt'],
      where: {
        game: req.params['game']
      }
    }).then(tournaments => {
      response.history = tournaments
    });
    if (response.active.length == 0 && response.history.length == 0)
      res.status(404).send({ message: 'Tournaments not found!' });
    else
      res.status(200).send(response)
  }
  catch {
    res.status(404).send({ message: 'Error' });
  };
};

exports.getTournamentMapById = (req, res) => {
  try {
    activeTournaments.findOne({
      where: {
        tournament_key: req.params['tournament_key']
      }
    }).then(tournament => {
      res.send({ map: tournament.map });
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
  var tournamentType;
  try {
    switch (req.body.type) {
      case 'history':
        tournamentType = historyTournaments
        break;
      case 'active':
        tournamentType = activeTournaments
        break;
    }
    tournamentType.findOne({
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
            tournamentsLevel.findAll({
              where: {
                tournament_key: founded.tournament_key
              }
            }).then(async levels_founded => {
              levels_founded.forEach(async level => {
                if (level.isWin && level.player_ID != null) {
                  result[level.player_ID] += level.win_cost
                }
                else {
                  result[level.player_ID] -= level.lose_cost
                }
              });
              const getGamesCount = async (user_id) => {
                const { count, rows } = await tournamentsLevel.findAndCountAll({
                  where: {
                    tournament_key: founded.tournament_key,
                    player_ID: user_id
                  }
                })
                return count
              }
              var tuples = [];
              for (var key in result) tuples.push([key, result[key], await getGamesCount(key)]);
              let purchases_arr;
              tuples.forEach(async (user) => {
                purchases_arr = await purchases.findAll({
                  where: {
                    user_id: user[0],
                    game: founded.game,
                    tournament_key: founded.tournament_key
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
                    // return 0

                  }
                })
              }
              setTimeout(async () => {
                sort(tuples)

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
                  resp.push({
                    username: await findUserName(key),
                    earned: value,
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
              }, 2000);
            }).catch((err) => {
              res.status(404).send('Not found!');
            })
            break;
          case 'PAC_BALL':
            tournamentsLevel.findAll({
              where: {
                tournament_key: founded.tournament_key
              }
            }).then(async levels_founded => {
              levels_founded.forEach(async level => {
                if (level.isWin && level.player_ID != null) {
                  result[level.player_ID] += level.win_cost
                }
                else {
                  result[level.player_ID] -= level.lose_cost
                }
              });
              const getGamesCount = async (user_id) => {
                const { count, rows } = await tournamentsLevel.findAndCountAll({
                  where: {
                    tournament_key: founded.tournament_key,
                    player_ID: user_id
                  }
                })
                return count
              }
              var tuples = [];
              for (var key in result) tuples.push([key, result[key], await getGamesCount(key)]);
              let purchases_arr;
              tuples.forEach(async (user) => {
                purchases_arr = await purchases.findAll({
                  where: {
                    user_id: user[0],
                    game: founded.game,
                    tournament_key: founded.tournament_key
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
                    // return 0

                  }
                })
              }
              setTimeout(async () => {
                sort(tuples)

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
                  resp.push({
                    username: await findUserName(key),
                    earned: value,
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
              }, 2000);
            }).catch((err) => {
              res.status(404).send('Not found!');
            })
            break;
          case 'PAC_WARS':
            tournamentsLevel.findAll({
              where: {
                tournament_key: founded.tournament_key
              }
            }).then(async levels_founded => {
              levels_founded.forEach(async level => {
                if (level.isWin && level.player_ID != null) {
                  result[level.player_ID] += level.win_cost
                }
                else {
                  result[level.player_ID] -= level.lose_cost
                }
              });
              const getGamesCount = async (user_id) => {
                const { count, rows } = await tournamentsLevel.findAndCountAll({
                  where: {
                    tournament_key: founded.tournament_key,
                    player_ID: user_id
                  }
                })
                return count
              }
              var tuples = [];
              for (var key in result) tuples.push([key, result[key], await getGamesCount(key)]);
              let purchases_arr;
              tuples.forEach(async (user) => {
                purchases_arr = await purchases.findAll({
                  where: {
                    user_id: user[0],
                    game: founded.game,
                    tournament_key: founded.tournament_key
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
                    // return 0

                  }
                })
              }
              setTimeout(async () => {
                sort(tuples)

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
                  resp.push({
                    username: await findUserName(key),
                    earned: value,
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
              }, 2000);
            }).catch((err) => {
              res.status(404).send('Not found!');
            })
            break;
        }
      })
      .catch((err) => {
        return res.status(404).send('Not found!');
      })
  }
  catch {
    res.status(500).send({ message: 'tournamentId не существует' });
  };
};


