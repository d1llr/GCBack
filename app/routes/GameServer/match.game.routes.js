const { authAPI } = require("../../middleware");
const controller = require("../../controllers/GameServer/match.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/GS/match/startMatch", [authAPI.verifyApiKey], controller.startMatch);

    app.post("/api/GS/match/finishMatch", [authAPI.verifyApiKey], controller.finishMatch);

};
