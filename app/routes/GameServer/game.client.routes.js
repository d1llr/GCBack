
import { checkVersion } from "../../controllers/GameServer/games.gs.controller.js";

export default function GameClientRoutes (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/GS/game/checkVersion/:name", checkVersion);
  

};
