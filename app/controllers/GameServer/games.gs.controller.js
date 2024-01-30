const db = require("../../models");
const { gameVersion: gameVersion } = db;


exports.checkVersion = (req, res) => {
  console.log(req.params["name"]);
  try {
    gameVersion.findOne({
      where: {
        name: req.params["name"]
      }
    }).then(game => {
      res.status(200).send(game.version);
      console.log(game.version);
    })
      .catch((err) => {
        res.status(402).send(err);
        console.log(err);
      })
  }
  catch {
    res.status(500).send({ message: 'checkVersion error!' });
  };
};


