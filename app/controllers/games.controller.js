const db = require("../models");
const { games: games } = db;
const fs = require('fs');


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
      fs.readdir(game.scr_dir, (err, files) => {
        if (err) console.log(err);
        res.status(200).send({
          game: game,
          screenshots: files
        });
      });
    })
  }
  catch {
    res.status(500).send({ message: 'gameId не существует' });
  };
};


