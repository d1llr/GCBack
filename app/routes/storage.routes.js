const { authJwt } = require("../middleware");
const controller = require("../controllers/storage.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/storage/:section/:image", controller.getImage);


    app.get("/storage/:section/:game/:image", controller.getGameImage);
    // app.get(
    //   "/api/test/user",
    //   [authJwt.verifyToken],
    //   controller.userBoard
    // );

    // app.get(
    //   "/api/test/mod",
    //   [authJwt.verifyToken, authJwt.isModerator],
    //   controller.moderatorBoard
    // );

    // app.get(
    //   "/api/test/admin",
    //   [authJwt.verifyToken, authJwt.isAdmin],
    //   controller.adminBoard
    // );
};
