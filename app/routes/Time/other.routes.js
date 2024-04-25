
import { getCurrentSupply } from "../../controllers/Time/time.controller.js";

export default function OtherRoutes (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/getCurrentSupply", [], getCurrentSupply);
};
