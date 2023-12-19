const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/user/getInfoById/:id", [authJwt.verifyToken], controller.getInfoById);


  app.post("/api/user/setWallet", [authJwt.verifyToken], controller.setWallet);

  app.post("/api/user/removeWallet", [authJwt.verifyToken], controller.removeWallet);


  app.post("/api/user/rechargeBalance", [authJwt.verifyToken], controller.rechargeBalance);
  app.post("/api/user/withdrawBalance", [authJwt.verifyToken], controller.withdrawBalance);

  app.get(
    "/api/test/mod",
    [authJwt.verifyToken, authJwt.isModerator],
    controller.moderatorBoard
  );

  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );
};
