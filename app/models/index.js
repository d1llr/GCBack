import { DB, USER, PASSWORD, HOST, dialect as _dialect, pool as _pool } from "../config/db.config.js";

import Sequelize from "sequelize";
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

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js").default(sequelize, Sequelize);
db.games = require("../models/games.model.js")(sequelize, Sequelize);
db.nft = require("../models/nft.model.js")(sequelize, Sequelize);
db.Tournaments = require("../models/Tournaments/tournaments.model.js")(sequelize, Sequelize);
db.activeTournaments = require("../models/Tournaments/activeTournaments.model.js")(sequelize, Sequelize);
db.historyTournaments = require("../models/Tournaments/historyTournaments.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.refreshToken = require("../models/refreshToken.model.js")(sequelize, Sequelize);

// Покупки

db.purchases = require("../models/purchases.model.js")(sequelize, Sequelize);

//GAME SERVER

db.gameVersion = require('../models/GameServer/gamesVersion.model.js')(sequelize, Sequelize);
db.api_key = require('../models/GameServer/api.key.model.js').default(sequelize, Sequelize);
db.matches = require('../models/GameServer/matches.model.js')(sequelize, Sequelize);
db.levels = require('../models/GameServer/levels.model.js')(sequelize, Sequelize);
db.tournamentsLevel = require('../models/Tournaments/tournamentsLevels.js')(sequelize, Sequelize);
db.balance_histories = require('../models/balance_histories.model.js').default(sequelize, Sequelize);
db.deal_history = require('../models/deal_history.model.js')(sequelize, Sequelize);


// --------------------------------------------------------------------- //
// subscriptions //
db.Subscriptions = require('../models/subscriptions.model.js').default(sequelize, Sequelize);
db.Subscribe_limits = require('./subscribe_limits.model.js')(sequelize, Sequelize);
db.subscription_feautures = require('../models/subscription_feautures.model.js').default(sequelize, Sequelize);
db.users_subscriptions = require('../models/users_subscriptions.models.js').default(sequelize, Sequelize);
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
