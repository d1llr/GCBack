export default (sequelize, Sequelize) => {
  const activeTournaments = sequelize.define("active_tournaments", {
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
    map: {
      type: Sequelize.STRING
    },
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    address: {
      type: Sequelize.STRING
    },
    chainID: {
      type: Sequelize.STRING
    },
    players: {
      type: Sequelize.STRING
    },
    cost: {
      type: Sequelize.INTEGER
    },
    awards: {
      type: Sequelize.STRING
    },
    game: {
      type: Sequelize.STRING
    },
    game_name: {
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

  return activeTournaments;
};
