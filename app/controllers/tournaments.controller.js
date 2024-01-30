const e = require("express");
const db = require("../models");
const { sendMessage } = require("../../websocketserver");
const { tournaments: tournaments, activeTournaments: activeTournaments, historyTournaments: historyTournaments, user: users, matches: matches } = db;
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
          await user.decrement('balance', {
            by: Number(founded.cost)
          }).then(()=>{
            sendMessage(user.balance)
          })
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

            console.log(resp);
            res.status(200).json(resp);

          }).catch((err) => {
            console.log(err);
            res.status(404).send('Not found!');
          })
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
        })
        .catch((err) => {
          console.log(err);
          res.status(404).send('Not found!');
        })
      break;
  }
};


