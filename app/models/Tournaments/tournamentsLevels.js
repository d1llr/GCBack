module.exports = (sequelize, Sequelize) => {
    const tournamentsLevels = sequelize.define("tournaments_levels", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
        },
        level: {
            type: Sequelize.STRING
        },
        win_cost: {
            type: Sequelize.INTEGER
        },
        lose_cost: {
            type: Sequelize.INTEGER
        },
        player_ID: {
            type: Sequelize.STRING
        },
        tournament_key: {
            type: Sequelize.STRING
        },
        tournament_participants: {
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

    return tournamentsLevels;
};
