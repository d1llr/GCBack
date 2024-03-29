const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    operatorsAliases: false,

    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    },
    logging: false
  },
  
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.games = require("../models/games.model.js")(sequelize, Sequelize);
db.nft = require("../models/nft.model.js")(sequelize, Sequelize);
db.tournaments = require("../models/Tournaments/tournaments.model.js")(sequelize, Sequelize);
db.activeTournaments = require("../models/Tournaments/activeTournaments.model.js")(sequelize, Sequelize);
db.historyTournaments = require("../models/Tournaments/historyTournaments.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.refreshToken = require("../models/refreshToken.model.js")(sequelize, Sequelize);

// Покупки

db.purchases = require("../models/purchases.model.js")(sequelize, Sequelize);

//GAME SERVER

db.gameVersion = require('../models/GameServer/gamesVersion.model.js')(sequelize, Sequelize);
db.api_key = require('../models/GameServer/api.key.model.js')(sequelize, Sequelize);
db.matches = require('../models/GameServer/matches.model.js')(sequelize, Sequelize);
db.levels = require('../models/GameServer/levels.model.js')(sequelize, Sequelize);
db.tournamentsLevel = require('../models/Tournaments/tournamentsLevels.js')(sequelize, Sequelize);

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

db.ROLES = ["user", "admin", "moderator"];

module.exports = db;
