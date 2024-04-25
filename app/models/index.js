import { DB, USER, PASSWORD, HOST, dialect as _dialect, pool as _pool } from "../config/db.config.js";
import User from './user.model.js'
import Games from './games.model.js'
import Nft from './nft.model.js'
import Tournaments from './Tournaments/tournaments.model.js'
import activeTournaments from './Tournaments/activeTournaments.model.js'
import historyTournaments from './Tournaments/historyTournaments.model.js'
import tournamentsLevels from './Tournaments/tournamentsLevels.js'
import Role from './role.model.js'
import RefreshToken from './refreshToken.model.js'
import Purchases from "./purchases.model.js";
import gameVersion from './GameServer/gamesVersion.model.js'
import api_key from './GameServer/api.key.model.js'
import matches from './GameServer/matches.model.js'
import levels from './GameServer/levels.model.js'
import balance_histories from './balance_histories.model.js'
import deal_history from './deal_history.model.js'
import Subscriptions from './Subscriptions/subscriptions.model.js'
import Subscribe_limits from './Subscriptions/subscribe_limits.model.js'
import Subscription_features from './Subscriptions/subscription_feautures.model.js'
import Users_subscriptions from './Subscriptions/users_subscriptions.models.js'


import Sequelize from "sequelize";
console.log(USER);
const sequelize = new Sequelize(
  DB,
  USER,
  PASSWORD,
  {
    host: HOST,
    dialect: _dialect,
    operatorsAliases: false,

    pool: {
      max: _pool.max,
      min: _pool.min,
      acquire: _pool.acquire,
      idle: _pool.idle
    },
    logging: false
  },

);

const db = {};

db.sequelize = sequelize;

db.user = User(sequelize, Sequelize)
db.games = Games(sequelize, Sequelize)
db.nft = Nft(sequelize, Sequelize)
db.Tournaments = Tournaments(sequelize, Sequelize)
db.activeTournaments = activeTournaments(sequelize, Sequelize)
db.historyTournaments = historyTournaments(sequelize, Sequelize)
db.role = Role(sequelize, Sequelize)
db.refreshToken = RefreshToken(sequelize, Sequelize)

// Покупки

db.purchases = Purchases(sequelize, Sequelize);

//GAME SERVER

db.gameVersion = gameVersion(sequelize, Sequelize);
db.api_key = api_key(sequelize, Sequelize);
db.matches = matches(sequelize, Sequelize);
db.levels = levels(sequelize, Sequelize);
db.tournamentsLevel = tournamentsLevels(sequelize, Sequelize);
db.balance_histories = balance_histories(sequelize, Sequelize);
db.deal_history = deal_history(sequelize, Sequelize);


// --------------------------------------------------------------------- //
// subscriptions //
db.Subscriptions = Subscriptions(sequelize, Sequelize);
db.Subscribe_limits = Subscribe_limits(sequelize, Sequelize);
db.subscription_feautures = Subscription_features(sequelize, Sequelize);
db.users_subscriptions = Users_subscriptions(sequelize, Sequelize);
// --------------------------------------------------------------------- //

db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});

db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});

db.refreshToken.belongsTo(db.user, {
  foreignKey: 'userId', targetKey: 'id'
});

db.user.hasOne(db.refreshToken, {
  foreignKey: 'userId', targetKey: 'id'
});


db.levels.hasOne(db.balance_histories, {
  foreignKey: 'levelId', targetKey: 'id'
});

db.user.hasMany(db.deal_history, {
  foreignKey: 'user_id'
});


db.Subscriptions.belongsToMany(db.Subscribe_limits, {
  through: db.subscription_feautures,
  foreignKey: 'subscriptionId',
  otherKey: 'limitId',
})
db.Subscribe_limits.belongsTo(db.Subscriptions, {
  through: db.subscription_feautures,
  foreignKey: 'limitId',
  otherKey: 'subscriptionId',
})


db.Subscriptions.belongsToMany(db.user, {
  through: db.users_subscriptions,
})
db.user.belongsToMany(db.Subscriptions, {
  through: db.users_subscriptions,
})




// db.user.hasOne(db.Subscriptions,{
//   foreignKey:'subscriptionId',
//   targetKey:'subscribe'
// })
// db.Subscriptions.belongsTo(db.user,{
// })

// db.Subscriptions.hasMany(db.user, {
//   foreignKey: 'subscribe'
// })
// db.user.belongsTo(db.Subscriptions, {
//   foreignKey: 'subscribe'
// })

db.ROLES = ["user", "admin", "moderator"];

export default db;
