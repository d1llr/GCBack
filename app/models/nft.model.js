module.exports = (sequelize, Sequelize) => {
  const Nft = sequelize.define("nft", {
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

  return Nft;
};
