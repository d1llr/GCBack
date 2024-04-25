const db = require("../models").default;
const { games: games } = db;
const fs = require('fs');


exports.getAll = (req, res) => {
  try {
    games.findAll({
      attributes: ['id', 'name', 'short_desc', 'active']
    }).then(games => {
      res.send(games);
    });
  }
  catch {
    res.status(500).send({ message: err.message });
  };
};

exports.getById = (req, res) => {
  try {
    games.findOne({
      attributes: ['id', 'name', 'short_desc', 'links', 'code'],
      where: {
        id: req.params["gameId"]
      }
    }).then(game => {
      res.status(200).send(game);
    })
  }
  catch {
    res.status(500).send({ message: 'gameId не существует' });
  };
};


