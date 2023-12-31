const { authJwt } = require("../middleware");
const controller = require("../controllers/tournaments.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/tournaments/all", [authJwt.verifyToken], controller.getAll);

  app.get("/api/tournaments/:tournamentId", [authJwt.verifyToken], controller.getById);

};
