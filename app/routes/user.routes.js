import { verifyToken, verifyApiKey, checkDuplicateEmail, checkDuplicateUsername } from "../middleware";
import {
  getInfoById,
  getUserName,
  getIdByToken,
  getUserFee,
  getUserHistory,
  GetUserGamesCount,
  changePassword, checkOldPassword, changeEmail, changeUserData, deleteAccount, Purchases, Sell, setWallet, removeWallet, getSubscription, getSubscriptionById, getAvaliableLevels, changeSubscription, changeAutoRenew, rechargeBalance, canIWithdraw, withdrawBalance, moderatorBoard, adminBoard
} from "../controllers/user.controller";
export default function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  // получение инфы о юзере
  app.get("/api/user/getInfoById/:id", [verifyToken], getInfoById);
  app.get("/api/user/getUserName/:id", [verifyToken], getUserName);
  app.get("/api/user/getIdByToken/:wallet", [verifyApiKey], getIdByToken);
  app.get("/api/user/getUserFee/:wallet", [verifyApiKey], getUserFee);
  app.post("/api/user/getUserHistory", [verifyToken], getUserHistory);
  app.post("/api/user/GetUserGamesCount", [verifyToken], GetUserGamesCount);


  app.post("/api/user/changePassword", [], changePassword);
  app.post("/api/user/checkOldPassword", [verifyToken], checkOldPassword);
  app.post("/api/user/changeEmail", [checkDuplicateEmail, verifyToken], changeEmail);
  app.post("/api/user/changeUserData", [verifyToken, checkDuplicateUsername], changeUserData);
  app.post("/api/user/deleteAccount", [verifyToken], deleteAccount);


  app.post("/api/user/inGamePurchases", [verifyToken], Purchases);
  app.post("/api/user/inGameSell", [verifyToken], Sell);

  app.post("/api/user/setWallet", [verifyToken], setWallet);
  app.post("/api/user/removeWallet", [verifyToken], removeWallet);



  app.get("/api/user/getSubs", [verifyToken], getSubscription);
  app.get("/api/user/getSubsById/:id/:userId", [verifyToken], getSubscriptionById);
  app.get("/api/user/getAvaliableLevels/:id", [verifyToken], getAvaliableLevels);

  app.post("/api/user/changeSubscription", [verifyToken], changeSubscription);
  app.post("/api/user/changeAutoRenew", [verifyToken], changeAutoRenew);


  app.post("/api/user/rechargeBalance", [verifyToken], rechargeBalance);
  app.post("/api/user/canIWithdraw", [], canIWithdraw);
  app.post("/api/user/withdrawBalance", [verifyToken], withdrawBalance);


  //Сервер вовы
  app.post("/api/user/rechargeBalanceAPI", [verifyApiKey], rechargeBalance);

  app.post("/api/user/withdrawBalanceAPI", [verifyApiKey], withdrawBalance);


  app.get(
    "/api/test/mod",
    [verifyToken],
    moderatorBoard
  );

  app.get(
    "/api/test/admin",
    [verifyToken],
    adminBoard
  );
};
