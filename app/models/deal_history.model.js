export default (sequelize, Sequelize) => {
  const deal_history = sequelize.define("deal_history", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: Sequelize.INTEGER
    },
    newBalance: {
      type: Sequelize.INTEGER
    },
    oldBalance: {
      type: Sequelize.INTEGER
    },
    type: {
      type: Sequelize.STRING
    },
    subscription_id: {
      type: Sequelize.INTEGER
    }
  });

  return deal_history;
};
