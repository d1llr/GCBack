import { verifyToken } from "../../middleware/authJwt.js";
import { getCurrentDay } from "../../controllers/Time/time.controller.js";

export default function TimeRoutes (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/time/getCurrentDay", getCurrentDay);
};
