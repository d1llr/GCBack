const db = require("../models");
const { user: user } = db;



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

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};
