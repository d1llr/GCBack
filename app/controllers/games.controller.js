const db = require("../models");
const { games: games } = db;

exports.getAll = (req, res) => {
  try {
    games.findAll().then(games => {
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