import db from "../models/index.js";
import { wssSend } from "../utils/wss.js";
const users = db.user;
const levels = db.levels;
const balance_histories = db.balance_histories
const deal_history = db.deal_history
const users_subscriptions = db.users_subscriptions
var game
var levelId
var deal_type = undefined

export const InitListeners = () => {
  levels.afterUpdate((level, options) => {
    game = level.game
    levelId = level.id
  })





  // users_subscriptions.afterUpdate((user_subs, options) => {
  //   if (Object.keys(user_subs._changed).includes('expiration_date')) {
  //     console.log('users_subscriptions.afterUpdate', deal_type);
  //     deal_type = 'subscription'
  //   }
  // })

  users.afterUpdate((user, options) => {
    // console.log('changed', Object.keys(user._changed).includes('balance'))
    if (Object.keys(user._changed).includes('balance')) {
      // console.log(user)
      if (levelId) {
        let type;
        if (game) {
          type = user.dataValues.balance > user._previousDataValues.balance ? 'win' : 'lose'
        } else {
          type = user.dataValues.balance > user._previousDataValues.balance ? 'recharge' : 'withdrawal'
        }
        balance_histories.create({
          newBalance: user.dataValues.balance,
          oldBalance: user._previousDataValues.balance,
          user_id: user.dataValues.id,
          type: type,
          game: game,
          levelId: levelId
        }).catch(err => {
          console.log(err);
        })
      }
      else {
        if (Object.keys(user._changed).includes('balance')) {
          wssSend(user.id, 'balance', user.balance)
        }
      }

      // console.log(balance_histories)
    }
  })
}

