import { wssSend } from "../utils/wss.js";
import db from "../models/index.js";
const { users_subscriptions: user_subs, refreshToken: RefreshToken, Subscriptions } = db;

export const checkExpiredSubscription = async (req, res, next) => {
    const { refreshToken: requestToken } = req.body;
    let user = await RefreshToken.findOne({
        where: { token: requestToken },
        include: [{ model: _user, include: Subscriptions }]
    }).then(res => res.user)
    const userSubsctioptionExpirationDate = new Date(user.subscriptions[0].users_subscriptions.expiration_date) ?? null
    let now = new Date()
    if (userSubsctioptionExpirationDate) {

        if (now <= userSubsctioptionExpirationDate)
            next()
        else {
            if (user.subscriptions[0].users_subscriptions.autoRenewal) {
                let newDate = new Date(userSubsctioptionExpirationDate.setDate(userSubsctioptionExpirationDate.getDate() + 30)) + 30
                user.subscriptions[0].users_subscriptions.update({
                    expiration_date: newDate,
                })
                wssSend(user.id, 'subscription', 'Auto')
            }
            else {
                user.subscriptions[0].users_subscriptions.update({
                    subscriptionId: 1,
                    expiration_date: null,
                })
            }
        }

    }
};

