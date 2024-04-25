
export default Subscriptions = sequelize.define("subscription", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING
  },
  price: {
    type: Sequelize.INTEGER
  },
  subscriptionId: {
    type: Sequelize.INTEGER
  },
  description: {
    type: Sequelize.STRING
  }
}, {
  timestamps: false
})
