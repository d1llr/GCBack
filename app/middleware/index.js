import { verifyApiKey } from "./authAPI.js";
import { catchError, verifyToken } from "./authJwt.js";
import { checkDuplicateEmail, checkDuplicateUsername, checkRolesExisted } from "./verifySignUp.js";
import { checkExpiredSubscription } from "./SubscriptionExpiration.js";

export default {
  verifyApiKey,
  catchError,
  verifyToken,
  checkDuplicateEmail,
  checkDuplicateUsername, 
  checkRolesExisted,
  checkExpiredSubscription
};
