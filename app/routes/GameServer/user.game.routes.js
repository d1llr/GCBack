const { authJwt, authAPI } = require("../../middleware").default;
const controller = require("../../controllers/user.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  // убрал токен для вовы
  app.get("/api/GS/user/getBalance/:id", [authJwt.verifyToken], controller.getBalance);
  app.get("/api/GS/user/getBalanceAPI/:id", [authAPI.verifyApiKey], controller.getBalance);


};
