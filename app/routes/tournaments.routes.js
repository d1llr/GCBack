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


  // GC tournaments page
  app.get("/api/tournaments/all", [authJwt.verifyToken], controller.getAll);


  
  //game tournaments
  app.get("/api/tournaments/:game/all", [authJwt.verifyToken], controller.getAllByGame);

  app.get("/api/tournaments/activeAndHistory/all/:game", [authJwt.verifyToken], controller.getAllActiveAndHistoryTournaments);


  app.get("/api/tournaments/history", [authJwt.verifyToken], controller.getHistory);

  app.get("/api/tournaments/:tournamentId", [authJwt.verifyToken], controller.getById);

  app.get("/api/tournaments/:tournament_key/map", [authJwt.verifyToken], controller.getTournamentMapById);

  app.get("/api/tournaments/history/:tournamentId", [authJwt.verifyToken], controller.getByIdFromHistory);

  app.post("/api/tournaments/getParticipate", [authJwt.verifyToken], controller.getParticipate);

  app.post("/api/tournaments/getRating", [authJwt.verifyToken], controller.getRating);


};
