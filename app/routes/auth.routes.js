import { checkDuplicateEmail, checkDuplicateUsername, checkRolesExisted } from "../middleware/verifySignUp.js";
import { checkExpiredSubscription } from "../middleware/SubscriptionExpiration.js";
import { signup, sendCode, checkCode, signin, refreshToken } from "../controllers/auth.controller.js";

export default function Auth(app) {
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
      checkDuplicateUsername,
      checkDuplicateEmail,
      checkRolesExisted
    ],
    signup
  );
  app.post(
    "/api/auth/sendCodeUponRegister",
    [
      checkDuplicateEmail,
      checkDuplicateUsername,
      checkRolesExisted
    ],
    sendCode
  );
  app.post(
    "/api/auth/SendCodeWithEmailValidation",
    [
      checkDuplicateEmail,
    ],
    sendCode
  );
  app.post("/api/auth/sendCode", [], sendCode);

  app.post(
    "/api/auth/checkCode",
    checkCode
  );

  app.post("/api/auth/signin", signin);

  app.post("/api/auth/refreshtoken", [checkExpiredSubscription], refreshToken);
};
