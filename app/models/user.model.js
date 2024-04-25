export default (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
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
  });

  return User;
};
