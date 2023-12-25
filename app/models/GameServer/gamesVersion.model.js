module.exports = (sequelize, Sequelize) => {
    const gameVersion = sequelize.define("games_versions", {
        name: {
            type: Sequelize.STRING
        },
        id: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        version: {
            type: Sequelize.STRING
        }
    });

    return gameVersion;
};
