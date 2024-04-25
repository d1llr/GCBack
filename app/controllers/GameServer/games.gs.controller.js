const db = require("../../models").default;
const { gameVersion: gameVersion } = db;


exports.checkVersion = (req, res) => {
  console.log(`checking game version of game: ${req.params["name"]}`);
  try {
    if (req.params["name"])
      gameVersion.findOne({
        where: {
          name: req.params["name"]
        }
      }).then(game => {
        res.status(200).send(game.version);
      })
        .catch((err) => {
          res.status(402).send(err);
        })
  }
  catch {
    res.status(500).send({ message: 'checkVersion error!' });
  };
};


