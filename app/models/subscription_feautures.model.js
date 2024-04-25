import sub
const { subscription_feautures } = default

export default (sequelize, Sequelize) => {
  const Subscription_features = sequelize.define("subscription_features", {
    subscriptionId: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    limitId: {
      type: Sequelize.STRING
    },
    value: {
      type: Sequelize.STRING
    },
    text: {
      type: Sequelize.STRING
    }
  }, {
    timestamps: false
  })
  return Subscription_features
}