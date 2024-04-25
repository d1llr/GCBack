export default (sequelize, Sequelize) => {
  const Users_subscriptions = sequelize.define("users_subscriptions", {
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    subscriptionId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'subscriptions',
        key: 'id'
      }
    },
    expiration_date: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    },
    autoRenewal: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: false
  })
  return Users_subscriptions
}