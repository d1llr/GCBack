module.exports = (sequelize, Sequelize) => {
  const historyTournaments = sequelize.define("history_tournaments", {
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
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    players: {
      type: Sequelize.STRING
    },
    address:{
      type: Sequelize.STRING
    },
    chainID:{
      type: Sequelize.STRING
    },
    cost: {
      type: Sequelize.INTEGER
    },
    game: {
      type: Sequelize.STRING
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
    tournament_key: {
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

  return historyTournaments;
};
