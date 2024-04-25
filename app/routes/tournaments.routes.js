import { verifyToken } from "../middleware/authJwt.js";
import { getAll, getTournamentsByFilters, getFilters, GetTournamentsCount, getAllByGame, getAllActiveAndHistoryTournaments, getHistory, getById, getTournamentMapById, getByIdFromHistory, getParticipate, getRating } from "../controllers/tournaments.controller.js";

export default function Tournaments (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  // GC tournaments page
  app.post("/api/tournaments/all", [verifyToken], getAll);

  app.post("/api/tournaments/getTournamentsByFilters", [verifyToken], getTournamentsByFilters);

  //game tournaments
  app.get("/api/tournaments/getFilters", [verifyToken], getFilters);
  app.get("/api/tournaments/GetTournamentsCount", [verifyToken], GetTournamentsCount);

  app.get("/api/tournaments/:game/all", [verifyToken], getAllByGame);


  app.get("/api/tournaments/activeAndHistory/all/:game", [verifyToken], getAllActiveAndHistoryTournaments);


  app.get("/api/tournaments/history", [verifyToken], getHistory);

  app.get("/api/tournaments/:tournamentId", [verifyToken], getById);

  app.get("/api/tournaments/:tournament_key/map", [verifyToken], getTournamentMapById);

  app.get("/api/tournaments/history/:tournamentId", [verifyToken], getByIdFromHistory);

  app.post("/api/tournaments/getParticipate", [verifyToken], getParticipate);

  app.post("/api/tournaments/getRating", [verifyToken], getRating);


};
