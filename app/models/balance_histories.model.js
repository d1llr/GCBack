export default (sequelize, Sequelize) => {
    const balance_histories = sequelize.define("balance_histories", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      newBalance: {
        type: Sequelize.INTEGER
      },
      oldBalance: {
        type:Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING
      },
      game: {
        type: Sequelize.STRING
      },
    });
  
    return balance_histories;
  };
  