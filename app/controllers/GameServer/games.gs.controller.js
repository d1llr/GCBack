const db = require("../../models");
const { gameVersion: gameVersion } = db;


exports.checkVersion = (req, res) => {
  try {
    gameVersion.findOne({
      where: {
        name: req.params["name"]
      }
    }).then(game => {
      res.status(200).send(game.version);

    })
  }
  catch {
    res.status(500).send({ message: 'checkVersion error!' });
  };
};


