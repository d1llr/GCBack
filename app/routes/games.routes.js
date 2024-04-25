import { verifyToken } from "../middleware/authJwt.js";
import { getAll, getById } from "../controllers/games.controller.js";

export default function Games(app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/games/all", [verifyToken], getAll);

  app.get("/api/games/:gameId", [verifyToken], getById);
};
