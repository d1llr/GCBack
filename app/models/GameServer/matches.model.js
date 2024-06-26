export default (sequelize, Sequelize) => {
    const matches = sequelize.define("matches", {
        match_key: {
            type: Sequelize.STRING
        },
        id: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        match_name: {
            type: Sequelize.STRING
        },
        match_cost: {
            type: Sequelize.INTEGER
        },
        player_IDs: {
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
        winner_id: {
            type: Sequelize.STRING
        },
        game: {
            type: Sequelize.STRING
        },
    });

    return matches;
};
