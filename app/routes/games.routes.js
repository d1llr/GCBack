const { authJwt } = require("../middleware");
const controller = require("../controllers/games.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/games/all", [authJwt.verifyToken], controller.getAll);

  app.get("/api/games/:gameId", [authJwt.verifyToken], controller.getById);
};
