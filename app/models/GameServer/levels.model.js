module.exports = (sequelize, Sequelize) => {
    const levels = sequelize.define("levels", {
        id: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        level: {
            type: Sequelize.STRING
        },
        level_cost: {
            type: Sequelize.INTEGER
        },
        player_ID: {
            type: Sequelize.STRING
        },
        end: {
            type: Sequelize.BOOLEAN
        },
        game: {
            type: Sequelize.STRING
        },
        level_key: {
            type: Sequelize.STRING
        },
        isWin: {
            type: Sequelize.BOOLEAN
        }
    });

    return levels;
};
