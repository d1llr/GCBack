export default (sequelize, Sequelize) => {
    const gameVersion = sequelize.define("game_versions", {
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
    }, {
        timestamps: false
    });

    return gameVersion;
};
