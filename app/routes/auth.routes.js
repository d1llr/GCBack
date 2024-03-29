const { verifySignUp, authJwt } = require("../middleware");
const controller = require("../controllers/auth.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsername,
      verifySignUp.checkDuplicateEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );
  app.post(
    "/api/auth/sendCodeUponRegister",
    [
      verifySignUp.checkDuplicateEmail,
      verifySignUp.checkDuplicateUsername,
      verifySignUp.checkRolesExisted
    ],
    controller.sendCode
  );
  app.post(
    "/api/auth/SendCodeWithEmailValidation",
    [
      verifySignUp.checkDuplicateEmail,
    ],
    controller.sendCode
  );
  app.post("/api/auth/sendCode", [], controller.sendCode);

  app.post(
    "/api/auth/checkCode",
    controller.checkCode
  );

  app.post("/api/auth/signin", controller.signin);

  app.post("/api/auth/refreshtoken", controller.refreshToken);
};
