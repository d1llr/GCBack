module.exports = (sequelize, Sequelize) => {
  const Subscribe_limits = sequelize.define("subscribe_limits", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    },
    limitId: {
      type: Sequelize.INTEGER
    }
  },{
    timestamps: false
  })
  return Subscribe_limits
}