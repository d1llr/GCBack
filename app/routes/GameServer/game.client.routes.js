const { authJwt } = require("../middleware");
const controller = require("../../controllers/GameServer/games.gs.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/GS/game/checkVersion/:name", [authJwt.verifyToken], controller.checkVersion);

};
