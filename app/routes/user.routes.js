const { authJwt, authAPI, verifySignUp } = require("../middleware");
const controller = require("../controllers/user.controller");
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  // получение инфы о юзере
  app.get("/api/user/getInfoById/:id", [authJwt.verifyToken], controller.getInfoById);
  app.get("/api/user/getUserName/:id", [authJwt.verifyToken], controller.getUserName);
  app.get("/api/user/getIdByToken/:wallet", [authAPI.verifyApiKey], controller.getIdByToken);
  app.post("/api/user/getUserHistory", [authJwt.verifyToken], controller.getUserHistory);
  app.post("/api/user/GetUserGamesCount", [authJwt.verifyToken], controller.GetUserGamesCount);


  app.post("/api/user/changePassword", [], controller.changePassword);
  app.post("/api/user/checkOldPassword", [authJwt.verifyToken], controller.checkOldPassword);
  app.post("/api/user/changeEmail", [verifySignUp.checkDuplicateEmail, authJwt.verifyToken], controller.changeEmail);
  app.post("/api/user/changeUserData", [authJwt.verifyToken, verifySignUp.checkDuplicateUsername], controller.changeUserData);
  app.post("/api/user/deleteAccount", [authJwt.verifyToken], controller.deleteAccount);


  app.post("/api/user/inGamePurchases", [authJwt.verifyToken], controller.Purchases);
  app.post("/api/user/setWallet", [authJwt.verifyToken], controller.setWallet);
  app.post("/api/user/removeWallet", [authJwt.verifyToken], controller.removeWallet);


  app.post("/api/user/rechargeBalance", [authJwt.verifyToken], controller.rechargeBalance);
  app.post("/api/user/withdrawBalance", [authJwt.verifyToken], controller.withdrawBalance);


  //Сервер вовы
  app.post("/api/user/rechargeBalanceAPI", [authAPI.verifyApiKey], controller.rechargeBalance);

  app.post("/api/user/withdrawBalanceAPI", [authAPI.verifyApiKey], controller.withdrawBalance);


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
