module.exports = (sequelize, Sequelize) => {
  const Games = sequelize.define("games", {
    active: {
      type: Sequelize.BOOLEAN
    },
    image: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    scr_dir: {
      type: Sequelize.STRING
    },
    links: {
      type: Sequelize.JSON
    },
    short_desc: {
      type: Sequelize.STRING
    },
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },

  });

  return Games;
};
