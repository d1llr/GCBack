module.exports = (sequelize, Sequelize) => {
  const Games = sequelize.define("games", {
    image: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    }
  });

  return Games;
};
