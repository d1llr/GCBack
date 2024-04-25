const { authAPI, authJwt } = require("../../middleware").default;
const controller = require("../../controllers/GameServer/match.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token,Authorization, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/GS/match/startMatch", [authAPI.verifyApiKey], controller.startMatch);
    app.post("/api/GS/match/startSingleMatch", [authJwt.verifyToken], controller.startSingleMatch);
    app.post("/api/GS/match/startSingleTournamentMatch", [authJwt.verifyToken], controller.startSingleTournamentMatch);


    app.post("/api/GS/match/finishMatch", [authAPI.verifyApiKey], controller.finishMatch);
    app.post("/api/GS/match/finishSingleMatch", [authJwt.verifyToken], controller.finishSingleMatch);
    app.post("/api/GS/match/finishSingleTournamentsMatch", [authJwt.verifyToken], controller.finishSingleTournamentsMatch);




    app.get("/api/user/singleMatch/getLastLevel/:id", [authJwt.verifyToken], controller.getLastLevel);

    app.get("/api/user/singleMatch/getLastLevel/:game_name/:id", [authJwt.verifyToken], controller.getLastLevel_v2);

    app.get("/api/user/singleMatch/getLastLevel/:tournament_key/:game_name/:id", [authJwt.verifyToken], controller.getLastLevelTournament);

};
