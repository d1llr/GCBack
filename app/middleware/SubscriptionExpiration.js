import { wssSend } from "../utils/wss.js";
import db from "../models/index.js";
const { users_subscriptions: user_subs, refreshToken: RefreshToken, Subscriptions, user: _user } = db;

export const checkExpiredSubscription = async (req, res, next) => {
    try {
        const { refreshToken: requestToken } = req.body;
        console.log(requestToken);
        let user = await RefreshToken.findOne({
            where: { token: requestToken },
            include: [{ model: _user, include: Subscriptions }]
        }).then(res => res.user)
        console.log(user.username);
        const userSubsctioptionExpirationDate =user.subscriptions[0].users_subscriptions.expiration_date ? new Date(user.subscriptions[0].users_subscriptions.expiration_date) : null
        let now = new Date()
        if (userSubsctioptionExpirationDate) {
            if (now <= userSubsctioptionExpirationDate)
                next()
            else {
                if (user.subscriptions[0].users_subscriptions.autoRenewal) {
                    if (user.subscriptions[0].users_subscriptions.subscriptionId != 1) {
                        let newDate = new Date(userSubsctioptionExpirationDate.setDate(userSubsctioptionExpirationDate.getDate() + 30)) + 30
                        user.subscriptions[0].users_subscriptions.update({
                            expiration_date: newDate,
                        })
                        wssSend(user.id, 'subscription', 'Subscription successfully renewed. Your plan remains unchanged.')
                    }
                }
                else {
                    user.subscriptions[0].users_subscriptions.update({
                        subscriptionId: 1,
                        expiration_date: null,
                        autoRenewal: false
                    })
                    wssSend(user.id, 'subscription', 'Your subscription has expired. Your plan has been changed to "Started"')
                }
            }
        }
        else {
            next()
        }
    }
    catch {
        console.log('Error with checking subs');
    }
};

