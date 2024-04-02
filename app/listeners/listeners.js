const db = require("../models");
const users = db.user;
const levels = db.levels;
const balance_histories = db.balance_histories
var game
var levelId
levels.afterUpdate((level, options) => {
  game = level.game
  levelId = level.id
})
users.afterUpdate((user, options) => {
  // console.log('changed', Object.keys(user._changed).includes('balance'))
  if (Object.keys(user._changed).includes('balance')) {
    // console.log(user)
    var type;
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
      levelId:levelId
    }).catch(err => {
      console.log(err);
    })
    // console.log(balance_histories)
  }
})