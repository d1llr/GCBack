const db = require("../models");
const { tournaments: tournaments } = db;

exports.getAll = (req, res) => {
  try {
    tournaments.findAll().then(tournament => {
      res.send(tournament);
    });
  }
  catch {
    res.status(500).send({ message: err.message });
  };
};

exports.getById = (req, res) => {
  try {
    tournaments.findOne({
      where: {
        id: req.params["tournamentId"]
      }
    }).then(tournament => {
      res.status(200).send(tournament);
    })
  }
  catch {
    res.status(500).send({ message: 'tournamentId не существует' });
  };
};