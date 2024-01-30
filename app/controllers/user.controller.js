const db = require("../models");
const { user: user } = db;
const { matches: matches, purchases: purchases } = db;



exports.getInfoById = (req, res) => {
  try {
    user.findOne({
      where: {
        id: req.params["id"]
      }
    }).then(founded => {
      res.status(200).send(founded);
    })
  }
  catch {
    res.status(500).send({ message: 'gameId не существует' });
  };
};
exports.getUserName = (req, res) => {
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
};


exports.Purchases = (req, res) => {
  console.log(Number(req.body.cost));
  try {
    purchases.create({
      user_id: req.body.user_id,
      game: req.body.game,
      cost: req.body.cost,
      product: req.body.product,
    })
      .then(() => {
        user.findOne({
          where: {
            id: req.body.user_id
          }
        }).then(u => {
          if (u.balance >= req.body.cost) {
            if (Number(req.body.cost) > 0) {
              u.decrement('balance', {
                by: Number(req.body.cost)
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
};


exports.getIdByToken = (req, res) => {
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
};


exports.getUserHistory = (req, res) => {
  var arr = []
  try {
    matches.findAll({
      where: {
        game: req.body.game
      }
    }).then(founded => {
      founded.map(match => {
        if (match.player_IDs.split(',').includes(req.body.id.toString())) {
          arr.push({
            title: match.match_name,
            isWinner: match.winner_id == req.body.id ? true : false,
            match_cost: match.match_cost,
            createdAt: match.createdAt
          })
        }
      })
      res.status(200).json(arr);
    }).catch(err => {
      console.log(err);
    })
  }
  catch {
    res.status(500).send({ message: 'gameId не существует' });
  };
};
exports.setWallet = (req, res) => {
  // Save User to Database
  console.log(req.body);
  try {
    user.findOne({
      where: {
        id: req.body.id
      }
    }).then(u => {
      u.update({
        wallet: req.body.wallet
      })
        .then(() => {
          res.status(200).send('Wallet init success');

        })
    })
  }
  catch {
    res.status(500).send({ message: 'Wallet error!' });
  };
};

exports.removeWallet = (req, res) => {
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
};



exports.getBalance = (req, res) => {
  try {
    user.findOne({
      where: {
        id: req.params["id"]
      }
    }).then(founded => {
      res.status(202).json(founded.balance);
    })
      .catch((err) => {
        res.status(402).send(err);
      })
  }
  catch {
    res.status(500).send({ message: 'gameId не существует' });
  };
};


exports.rechargeBalance = (req, res) => {
  // Save User to Database
  console.log(req.body);
  try {
    user.findOne({
      where: {
        id: req.body.id
      }
    }).then(u => {
      u.increment('balance', {
        by: Number(req.body.amount)
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
};



exports.withdrawBalance = (req, res) => {
  // Save User to Database
  console.log(req.body);
  try {
    user.findOne({
      where: {
        id: req.body.id
      }
    }).then(u => {
      if (u.balance >= req.body.amount) {
        u.decrement('balance', {
          by: Number(req.body.amount)
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
};


exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};
