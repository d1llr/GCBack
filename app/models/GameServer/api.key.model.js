module.exports = (sequelize, Sequelize) => {
    const api_key = sequelize.define("api_key", {
        name: {
            type: Sequelize.STRING
        },
        id: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        api_key: {
            type: Sequelize.STRING
        }
    });

    return api_key;
};
