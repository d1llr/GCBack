module.exports = (sequelize, Sequelize) => {
  const Subscriptions = sequelize.define("subscriptions", {
    username: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    wallet: {
      type: Sequelize.STRING
    },
    balance: {
      type: Sequelize.INTEGER
    },
    subscription: {
      type: Sequelize.INTEGER
    },
  });

  return Subscriptions;
};
