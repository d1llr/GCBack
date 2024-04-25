import { verifyToken } from "../../middleware/authJwt.js";
import { verifyApiKey } from "../../middleware/authAPI.js";
import { getBalance } from "../../controllers/user.controller.js";

export default function UserGames (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  // убрал токен для вовы
  app.get("/api/GS/user/getBalance/:id", [verifyToken], getBalance);
  app.get("/api/GS/user/getBalanceAPI/:id", [verifyApiKey], getBalance);


};
