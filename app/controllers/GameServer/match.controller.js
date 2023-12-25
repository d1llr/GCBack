const db = require("../../models");
const { matches: matches, user: users } = db;



exports.startMatch = (req, res) => {
    try {
        matches.create({
            match_key: req.body.match_key,
            match_name: req.body.match_name,
            match_cost: req.body.match_cost,
            player_IDs: req.body.player_IDs
        })
            .then(() => {
                res.status(200).send({ message: 'Match has been created!' });
            })
    }
    catch {
        res.status(500).send({ message: 'startMatch error!' });
    };
};

exports.finishMatch = (req, res) => {
    try {
        matches.findOne({
            where: {
                match_key: req.body.match_key
            }
        }).then(match => {
            match.update({
                end: true,
                winner_id: req.body.winner_id
            }).then(() => {
                winner = users.findByPk(
                    req.body.winner_id
                ).catch(() => {
                    res.status(501).send({ message: 'winners not found!' });
                })
                winner.update({
                    balance: match.match_cost * match.player_IDs.split(',').length
                }).catch(() => {
                    res.status(502).send({ message: 'winners did not receive their winnings!' });
                })
                users.findAll({
                    where: {
                        id: {
                            [Op.in]: match.player_IDs.split(','),
                            [Op.ne]: req.body.winner_id
                        }
                    }
                }).then(user => {
                    user.decrement('balance', {
                        by: match.match_cost
                    }).then(() => {
                        res.status(200).send({ message: 'Match has been ended succesfully!' });
                    }).catch(() => {
                        res.status(503).send({ message: 'Looser balance not decremented!' });
                    })
                }).catch(() => {
                    res.status(504).send({ message: 'Loosers not found!' });
                })
            }).catch(() => {
                res.status(505).send({ message: 'Match could not be ended!' });
            })
        }).catch(() => {
            res.status(506).send({ message: 'Match could not be found!' });
        })
    }
    catch {
        res.status(507).send({ message: 'finishMatch error!' });
    };
};


