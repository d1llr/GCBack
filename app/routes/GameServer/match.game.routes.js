
import { verifyApiKey } from "../../middleware/authAPI.js";
import { verifyToken } from "../../middleware/authJwt.js";
import { startMatch, startSingleMatch, startSingleTournamentMatch, finishMatch, finishSingleMatch, finishSingleTournamentsMatch, getLastLevel, getLastLevel_v2, getLastLevelTournament } from "../../controllers/GameServer/match.controller.js";

export default function MatchGameRoutes(app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token,Authorization, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/GS/match/startMatch", [verifyApiKey], startMatch);
    app.post("/api/GS/match/startSingleMatch", [verifyToken], startSingleMatch);
    app.post("/api/GS/match/startSingleTournamentMatch", [verifyToken], startSingleTournamentMatch);


    app.post("/api/GS/match/finishMatch", [verifyApiKey], finishMatch);
    app.post("/api/GS/match/finishSingleMatch", [verifyToken], finishSingleMatch);
    app.post("/api/GS/match/finishSingleTournamentsMatch", [verifyToken], finishSingleTournamentsMatch);




    app.get("/api/user/singleMatch/getLastLevel/:id", [verifyToken], getLastLevel);

    app.get("/api/user/singleMatch/getLastLevel/:game_name/:id", [verifyToken], getLastLevel_v2);

    app.get("/api/user/singleMatch/getLastLevel/:tournament_key/:game_name/:id", [verifyToken], getLastLevelTournament);

};
