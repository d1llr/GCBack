import db from "../models/index.js";
const { games: games } = db;


export function getAll(req, res) {
  try {
    games.findAll({
      attributes: ['id', 'name', 'short_desc', 'active', "code"],
      order:[['active', 'DESC']]
    }).then(games => {
      res.send(games);
    });
  }
  catch {
    res.status(500).send({ message: err.message });
  };
}

export function getById(req, res) {
  try {
    games.findOne({
      attributes: ['id', 'name', 'short_desc', 'links', 'code', 'instruction'],
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
}


