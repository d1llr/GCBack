export default (sequelize, Sequelize) => {
    const api_key = sequelize.define("api_key", {
        server: {
            type: Sequelize.STRING
        },
        id: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        api_key: {
            type: Sequelize.STRING
        }
    }, {
        timestamps: false
    });

    return api_key;
};
