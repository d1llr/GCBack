import { verifyToken } from '../middleware'
import { getAll, getById } from "../controllers/games.controller";

export default function (app) {
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
