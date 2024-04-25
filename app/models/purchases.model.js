export default (sequelize, Sequelize) => {
    const Purchases = sequelize.define("purchases", {
      id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      game: {
        type: Sequelize.STRING
      },
      cost: {
        type: Sequelize.INTEGER
      },
      product: {
        type: Sequelize.STRING
      },
      tournament_key:{
        type: Sequelize.STRING
      }
    });
  
    return Purchases;
  };
  