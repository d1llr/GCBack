module.exports = (sequelize, Sequelize) => {
  const Tournaments = sequelize.define("tournaments", {
    image: {
      type: Sequelize.STRING
    },
    disabled: {
      type: Sequelize.BOOLEAN
    },
    name: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    cost: {
      type: Sequelize.INTEGER
    },
    game: {
      type: Sequelize.STRING
    },
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    daysLeft: {
      type: Sequelize.STRING
    },
    dayOfWeekFrom: {
      type: Sequelize.STRING
    },
    dayOfWeekTo: {
      type: Sequelize.STRING
    },
    goal: {
      type: Sequelize.STRING
    },
    participants: {
      type: Sequelize.STRING
    },
    bank: {
      type: Sequelize.STRING
    },
  });

  return Tournaments;
};
