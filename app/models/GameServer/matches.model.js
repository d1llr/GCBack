module.exports = (sequelize, Sequelize) => {
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
        end: {
            type: Sequelize.BOOLEAN
        },
        winner_id: {
            type: Sequelize.STRING
        }
    });

    return matches;
};
