
import db from "../models/index.js";
const { user: user } = db;
const {
  matches: matches,
  levels: levels,
  purchases: purchases,
  activeTournaments: activeTournaments,
  games: games,
  balance_histories: balance_histories,
  Subscriptions: Subscriptions,
  subscription_feautures: subscription_features,
  Subscribe_limits: subscribe_limits,
  subscription_change: subscription_change,
} = db;

const Op = db.sequelize.Op;


import Sequelize from "sequelize";

import hashSync from "bcryptjs";
import compareSync from "bcryptjs";



export function getInfoById(req, res) {
  try {
    user.findOne({
      where: {
        id: req.params["id"]
      },
      include: Subscriptions
    }).then(founded => {
      res.status(200).send(founded);
    })
  }
  catch {
    res.status(500).send({ message: 'gameId не существует' });
  };
}
export function getUserName(req, res) {
  try {
    user.findOne({
      where: {
        id: req.params["id"]
      }
    }).then(founded => {
      res.status(200).json(founded.username);
    })
  }
  catch {
    res.status(500).send({ message: 'Username не существует' });
  };
}
export function changePassword(req, res) {
  console.log(req.body);
  try {
    user.findOne({
      where: {
        email: req.body.email
      }
    }).then(founded => {
      founded.update({
        password: hashSync(req.body.password, 8)
      })
      res.status(200).send({ message: 'Password updated successfully!' });
      return null
    }).catch(err => {
      res.status(404).send({ message: 'Email не существует' });

    })
  }
  catch {
    res.status(500).send({ message: 'Username не существует' });
  };
}

export function checkOldPassword(req, res) {
  console.log(req.body);
  try {
    user.findOne({
      where: {
        email: req.body.email
      }
    }).then(founded => {
      if (compareSync(req.body.OldPassword, founded.password))
        res.status(200).send({ message: 'Old pass is true' });
      else {
        res.status(400).send({ message: 'Old pass is false' });
      }
      return null
    }).catch(err => {
      res.status(404).send({ message: 'Email не существует' });

    })
  }
  catch {
    res.status(500).send({ message: 'Username не существует' });
  };
}

export function changeEmail(req, res) {
  console.log(req.body);
  try {
    user.findOne({
      where: {
        id: req.body.id
      }
    }).then(founded => {
      founded.update({
        email: req.body.email
      })
      res.status(200).send({ message: 'email updated successfully!' });
      return null
    }).catch(err => {
      res.status(404).send({ message: 'user не существует' });

    })
  }
  catch {
    res.status(500).send({ message: 'user не существует' });
  };
}

export function changeUserData(req, res) {
  console.log(req.body);
  try {
    user.findOne({
      where: {
        id: req.body.id
      }
    }).then(founded => {
      founded.update({
        name: req.body.name,
        username: req.body.username
      })
      res.status(200).send({ message: 'UserData updated successfully!' });
      return null
    }).catch(err => {
      res.status(404).send({ message: 'UserData не существует' });

    })
  }
  catch {
    res.status(500).send({ message: 'UserData не существует' });
  };
}

export function deleteAccount(req, res) {
  console.log(req.body);
  try {
    user.destroy({
      where: {
        email: req.body.email
      }
    }).then(founded => {
      res.status(200).send({ message: 'user deleted successfully!' });
      return null
    }).catch(err => {
      res.status(404).send({ message: 'user не существует' });

    })
  }
  catch {
    res.status(500).send({ message: 'user не существует' });
  };
}

export async function Purchases(req, res) {
  try {
    const getTournamentPlayers = async () => {
      var tournament_key = []
      await activeTournaments.findAll().then(tournaments => {
        tournaments.forEach(tournament => {

          tournament.players.split(',')?.includes(req.body.user_id) && tournament_key.push(tournament.tournament_key)
        });
      })
      return tournament_key.join(',')
    }

    purchases.create({
      user_id: req.body.user_id,
      game: req.body.game,
      cost: req.body.cost,
      product: req.body.product,
      tournament_key: req.body.tournament_key
    })
      .then(() => {
        user.findOne({
          where: {
            id: req.body.user_id
          }
        }).then(u => {
          if (u.balance >= req.body.cost) {
            if (Number(req.body.cost) > 0) {
              u.update({
                balance: u.balance - Number(req.body.cost)
              })
                .then(() => {
                  res.status(200).json({
                    balance: Number(u.balance) - Number(req.body.cost)
                  });
                });
            }
            else {
              res.status(498).send({ message: 'Purchases error!' });
            }
          }
          else {
            res.status(499).send({ message: 'Insufficient funds for purchase!' });
          }
        })
      })
      .catch(err => {
        res.status(500).send({ message: 'Purchases error!' });
      })
  }
  catch {
    res.status(500).send({ message: 'Purchases error!' });
  };
}


export async function Sell(req, res) {
  try {
    if (Number(req.body.cost) > 0) {
      user.findOne({
        where: {
          id: req.body.user_id
        }
      }).then(u => {
        u.update({
          balance: u.balance + Number(req.body.cost)
        })
          .then(() => {
            res.status(200).json({
              balance: Number(u.balance)
            });
          });


      })
    }
    else {
      res.status(498).send({ message: 'Purchases error!' });
    }
  }
  catch {
    res.status(500).send({ message: 'Purchases error!' });
  };
};


export function getIdByToken(req, res) {
  try {
    user.findOne({
      where: {
        wallet: req.params["wallet"]
      }
    }).then(founded => {
      res.status(200).json(founded.id);
    })
  }
  catch {
    res.status(500).send({ message: 'gameId не существует' });
  };
}

export function getUserFee(req, res) {
  try {
    user.findOne({
      where: {
        wallet: req.params["wallet"]
      },
      include: [{
        model: Subscriptions,
        include: subscribe_limits
      }]
    }).then(founded => {
      founded.subscriptions[0].subscribe_limits.map(item => {
        if (item.name == 'Withdrawal fee')
          res.status(200).json(item.subscription_features.value);
      })
    })
  }
  catch {
    res.status(500).send({ message: 'gameId не существует' });
  };
}

export async function getUserHistory(req, res) {
  var arr = []
  var essence;
  const essenceArray = { 'matches': matches, 'levels': levels }
  try {
    await games.findAll({
      attributes: ['code', 'essence'],
      where: {
        active: true
      },
    }).then(async (founded) => {
      await founded.forEach(async game => {
        if (req.body.game == game.code)
          essence = await essenceArray[game.essence]
      });
      await essence.findAll({
        where: {
          game: req.body.game,
        },
        include: balance_histories,
        order: [['createdAt', "DESC"]],
      }).then(founded => {
        founded.map(match => {
          console.log(match.id, ' : ', match.balance_history?.newBalance);
          if (match.player_IDs) {
            if (match.player_IDs?.split(',')?.includes(req.body.id.toString())) {
              arr.push({
                title: match.match_name,
                isWinner: match.winner_id == req.body.id ? true : false,
                match_cost: match.match_cost,
                createdAt: match.createdAt
              })
            }
          }
          else {
            if (match.player_ID?.toString().split(',')?.includes(req.body.id.toString())) {
              arr.push({
                title: match.level,
                isWinner: match.isWin ? true : false,
                match_cost: match.isWin ? match.win_cost : match.lose_cost,
                createdAt: match.createdAt,
                balance: match.balance_history?.newBalance
              })
            }
          }
        })
        res.status(200).json(arr.slice(req.body.offset, req.body.offset + req.body.limit));
      }).catch(err => {
        console.log(err);
      })
    })
    // switch (req.body.game) {
    //   case :

    //     break;

    //   default:
    //     break;
    // }
  }
  catch {
    res.status(500).send({ message: 'gameId не существует' });
  };
}

export function GetUserGamesCount(req, res) {
  var essence;
  var arr = []
  const essenceArray = { 'matches': matches, 'levels': levels }
  try {
    games.findAll({
      attributes: ['code', 'essence'],
      where: {
        active: true
      },
    }).then((founded) => {
      founded.forEach(game => {
        if (req.body.game == game.code)
          essence = essenceArray[game.essence]

      });
      essence.findAll({
        where: {
          game: req.body.game,
        },
      }).then(founded => {
        founded.map(match => {
          if (match.player_IDs) {
            if (match.player_IDs?.split(',')?.includes(req.body.id.toString())) {
              arr.push({
                title: match.match_name,
                isWinner: match.winner_id == req.body.id ? true : false,
                match_cost: match.match_cost,
                createdAt: match.createdAt
              })
            }
          }
          else {
            if (match.player_ID?.toString().split(',')?.includes(req.body.id.toString())) {
              arr.push({
                title: match.level,
                isWinner: match.isWin ? true : false,
                match_cost: match.isWin ? match.win_cost : match.lose_cost,
                createdAt: match.createdAt
              })
            }
          }
        })
        res.status(200).json(arr.length);
      }).catch(err => {
        res.status(503).json(err);
      })
    })

  }
  catch {
    res.status(404).send({ message: 'Error!' });

  }
}

export function setWallet(req, res) {
  // Save User to Database
  console.log(req.body);
  try {
    user.findOne({
      where: {
        id: req.body.id
      }
    }).then(u => {
      if (u.wallet == null) {
        u.update({
          wallet: req.body.wallet
        })
          .then(() => {
            res.status(200).send('Wallet init success');

          })
      } else if (u.wallet !== req.body.wallet) {
        res.status(503).send({ message: 'Wallet already exist!' });
      } else {
        res.status(200).send({ message: 'Wallet init success' });
      }

    })
  }
  catch {
    res.status(500).send({ message: 'Wallet error!' });
  };
}

export function removeWallet(req, res) {
  // Save User to Database
  console.log(req.body);
  try {
    user.findOne({
      where: {
        id: req.body.id
      }
    }).then(u => {
      u.update({
        wallet: null
      })
        .then(() => {
          res.status(200).send('Wallet remove success');

        })
    })
  }
  catch {
    res.status(500).send({ message: 'Wallet error!' });
  };
}

export function getSubscription(req, res) {

  try {
    Subscriptions.findAll({
      include: [{
        model: subscribe_limits,
        through: {
          attributes: ['text', 'value']
        }
      }]
    }).then(subs => {
      let arr = []
      subs.map(item => {
        // arr.push(item)
        let badge;
        let info = item.subscribe_limits.map(i => {

          if (i.name.includes('badge'))
            badge = i.subscription_features.value
          return i.subscription_features.text
        })
        const newData = {
          "id": item.id,
          "name": item.name,
          "price": item.price,
          "subscriptionId": item.subscriptionId,
          "description": item.description,
          'badge': badge,
          "textinfo": info

        };
        arr.push(newData)
      })
      res.status(200).send(arr);
    })

  }
  catch {
    res.status(500).send({ message: 'Subscriptions getting error!' });
  };
}

export function getSubscriptionById(req, res) {
  try {
    Subscriptions.findOne({
      where: {
        id: req.params["id"]
      },
      include: {
        model: user,
        where: {
          id: req.params["userId"]
        }
      }
    }).then(sub => {
      console.log(sub.users[0].users_subscriptions);

      setTimeout(() => {
        res.status(200).send({
          id: sub.id,
          name: sub.name,
          active_until: sub.users[0].users_subscriptions.expiration_date,
          autorenewal: sub.users[0].users_subscriptions.autoRenewal,
          status: sub.users[0].users_subscriptions.status
        });
      }, 1000);
    })

  }
  catch {
    res.status(500).send({ message: 'Subscriptions getting error!' });
  };
}

export function getAvaliableLevels(req, res) {
  try {
    Subscriptions.findOne({
      where: {
        id: req.params["id"]
      },
      include: subscribe_limits
    }).then(sub => {
      sub.subscribe_limits.map(item => {
        if (item.name == 'Level limit')
          res.status(200).json(item.subscription_features.value);
      })
      // res.status(200).json({
      //   id: sub.id,
      //   name: sub.name,
      //   active_until: sub.users[0].users_subscriptions.expiration_date,
      //   autorenewal: sub.users[0].users_subscriptions.autoRenewal,
      // });
    })
  }
  catch {
    res.status(500).send({ message: 'Subscriptions getting error!' });
  };
}

export function changeSubscription(req, res) {
  try {
    user.findOne({
      where: {
        id: req.body.userId
      },
      include: Subscriptions
    }).then(async user => {
      const price = await Subscriptions.findOne({
        where: {
          id: req.body.newsubscribe
        },
        attributes: ['price']
      })
      const UserSubscription = user.subscriptions[0]
      if (user.balance >= Number(price.price)) {
        // костыль невиданных размеров, спрашивать только у @rmadidntwakeup

        await db.users_subscriptions.update({
          subscriptionId: req.body.newsubscribe,
          expiration_date: new Date(new Date().setDate(new Date().getDate() + 30)),
          autoRenewal: req.body.autorenewal,
          status: true
        }, {
          where: {
            userId: user.id
          }
        })
        await user.subscriptions[0].users_subscriptions.update({
          subscriptionId: req.body.newsubscribe,
          expiration_date: new Date(new Date().setDate(new Date().getDate() + 30)),
          autoRenewal: req.body.autorenewal,
          status: true

        })
        await user.update({
          balance: user.balance - Number(price.price)
        })
        setTimeout(() => {
          res.status(200).send({ message: 'Subscription updated successfully' })
        }, 1000);
      } else {
        res.status(404).send({ message: 'Not enough money' });
      }
    }
    )
  }
  catch {
    res.status(500).send({ message: 'custom error' });
  };
}

export function changeAutoRenew(req, res) {
  try {
    db.users_subscriptions.update({
      autoRenewal: req.body.autorenewal,
      status: req.body.autorenewal
    }, {
      where: {
        userId: req.body.userId
      }
    })
    res.status(200).send({ message: 'Subscription updated successfully' })
  }
  catch {
    res.status(500).send({ message: 'custom error' });
  };
}

export function getBalance(req, res) {
  try {
    user.findOne({
      where: {
        id: req.params["id"]
      }
    }).then(founded => {
      res.send(founded.balance.toString());
    })
      .catch((err) => {
        console.log('balance err :', err);

        res.status(402).send({ message: 'Error' });
      })
  }
  catch {
    res.status(500).send({ message: 'gameId не существует' });
  };
}

export function rechargeBalance(req, res) {
  // Save User to Database
  console.log(req.body);
  try {
    user.findOne({
      where: {
        id: req.body.id
      }
    }).then(u => {
      u.update({
        balance: u.balance + Number(req.body.amount)
      })
        .then(() => {
          res.status(200).json({
            balance: Number(u.balance) + Number(req.body.amount)
          });
        })
        .catch(() => {
          res.status(500).send({ message: 'Balance error!' });
        })
    })
  }
  catch {
    res.status(500).send({ message: 'Balance error!' });
  };
}

export function canIWithdraw(req, res) {
  // Save User to Database\
  console.log(req.body);
  try {
    user.findOne({
      where: {
        id: req.body.id
      },
      include: [{
        model: db.deal_history,
        required: false,
        where: {
          type: 'withdrawal',
          createdAt: {
            [Op.lt]: new Date(),
            [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000)
          }
        }
      }, {
        model: Subscriptions,
        include: subscribe_limits
      }]
    }).then(u => {
      console.log('user', u);
      let subsWithdrawalLimit = 0
      let commision = 0
      let availableBalanceToWithdraw = 0;
      u.subscriptions[0].subscribe_limits.map(item => {
        if (item.name == 'Daily withdrawal limit') {
          subsWithdrawalLimit = item.subscription_features.value;
        }
        if (item.name == 'Withdrawal fee') {
          commision = item.subscription_features.value;
        }
      });
      u.deal_histories.map(item => {
        availableBalanceToWithdraw += item.oldBalance - item.newBalance
      });
      setTimeout(() => {
        res.status(200).send({
          AvailableToWithdraw: subsWithdrawalLimit - availableBalanceToWithdraw,
          commision: commision
        })

      }, 1000);
    }).catch(err => {
      console.log(err);
    })
  }
  catch {
    res.status(500).send({ message: 'Balance error!' });
  };
}

export function withdrawBalance(req, res) {
  // Save User to Database
  console.log('trying to withdraw');
  console.log(req.body);
  try {
    user.findOne({
      where: {
        id: req.body.id
      }
    }).then(u => {
      if (u.balance >= req.body.amount) {
        u.update({
          balance: u.balance - Number(req.body.amount)
        })
          .then(() => {
            res.status(200).json({
              balance: Number(u.balance) - Number(req.body.amount)
            });
          });
      }
      else {
        res.status(499).send({ message: 'Balance coudnt be < 0!' });
      }
    })
  }
  catch {
    res.status(500).send({ message: 'Balance error!' });
  };
}

export function userBoard(req, res) {
  res.status(200).send("User Content.");
}

export function adminBoard(req, res) {
  res.status(200).send("Admin Content.");
}

export function moderatorBoard(req, res) {
  res.status(200).send("Moderator Content.");
}

