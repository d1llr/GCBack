const db = require("../../models");
const { matches: matches, user: users, levels: levels, activeTournaments: activeTournaments } = db;
const Op = db.Sequelize.Op;



exports.startMatch = async (req, res) => {
    try {

        var tournament_participants = []
        var tournament_key = ''
        await activeTournaments.findAll({
            where: {
                game: req.body.game_name
            }
        }).then(tours => {
            tours.map(tr => {
                let tournament_players = tr.players.split(',')
                let match_players = req.body.player_IDs.split(',')
                match_players.forEach(player => {
                    if (tournament_players.includes(player)) {
                        tournament_participants.push(player)
                    }
                });
                tournament_key = tr.tournament_key
            })
        })
        console.log('tournament_participants', tournament_participants);
        console.log('tournament_keys', tournament_key);
        await matches.create({
            match_key: req.body.match_key,
            match_name: req.body.match_name,
            match_cost: req.body.match_cost,
            player_IDs: req.body.player_IDs,
            game: req.body.game_name,
            tournament_key: tournament_key,
            tournament_participants: tournament_participants.join(',')
        })
            .then(() => {
                res.status(200).send({ message: 'Match has been created!' });
            })
    }
    catch {
        res.status(500).send({ message: 'startMatch error!' });
    };
};

// тут может быть баг с созданием, потому что нода ругается  TypeError: Cannot convert undefined or null to object
exports.startSingleMatch = async (req, res) => {
    console.log(`Trying to start level ${req.body.level_key}`);

    try {
        await levels.findAll({
            where: {
                level: req.body.level_name,
                player_ID: req.body.player_id,
                end: false
            }
        })
            .then(levels => {
                levels.forEach(level => {
                    level.update({
                        end: true,
                        isWin: false
                    })
                    users.findOne({
                        where: {
                            id: level.player_ID
                        }
                    }).then(user => {
                        user.decrement('balance', {
                            by: level.level_cost
                        })
                    })
                });
            }).catch(err => {
                console.log(err);
            })
        const [user, created] = await levels.findOrCreate({
            where: { level: req.body.level_name, player_ID: req.body.player_id, isWin: true },
            defaults: {
                level: req.body.level_name,
                level_cost: req.body.cost,
                player_ID: req.body.player_id,
                game: req.body.game_name,
                level_key: req.body.level_key,
                isWin: null
            }
        })

        console.log(user);
        if (created) {
            res.status(200).send({ message: 'Level has been created!' });
        }
        else {
            res.status(500).send({ message: 'Level already exist!' });
        }
    }
    catch {
        res.status(200).send({ message: 'Level has been created!' });
    };
};

exports.getLastLevel = (req, res) => {
    try {
        console.log();
        if (req.params['id'])
            levels.max('level', {
                where: {
                    player_ID: req.params['id'],
                    isWin: true,
                    end: true
                }
            })
                .then(level => {
                    console.log('level', level);
                    res.status(200).json(level);
                })
                .catch(err => {
                    res.status(200).json(0);
                })
        else res.status(500).send({ message: 'Level error!' });
    }
    catch {
        res.status(500).send({ message: 'Level error!' });
    };
};

exports.finishSingleMatch = (req, res) => {
    console.log(`Trying to end level ${req.body.level_key}`);
    try {
        levels.findOne({
            where: {
                level_key: req.body.level_key
            }
        }).then(level => {

            console.log(req.body);
            level.update({
                end: true,
                isWin: req.body.isWin == 'False' ? false : true
            }).then(() => {
                users.findOne(
                    {
                        where: {
                            id: level.player_ID
                        }

                    }
                ).then(winner => {
                    if (req.body.isWin == 'False' ? false : true) {
                        winner.increment('balance', {
                            by: level.level_cost
                        }).then(() => {
                            res.status(200).send({ message: 'level has been ended succesfully!' });
                        }).catch((err) => {
                            console.log(err);

                            res.status(502).send({ message: 'winners did not receive their winnings!' });
                        })
                    }
                    else {
                        winner.decrement('balance', {
                            by: level.level_cost
                        }).then(() => {
                            res.status(200).send({ message: 'level has been ended succesfully!' });
                        }).catch((err) => {
                            console.log(err);
                            res.status(503).send({ message: 'Looser balance not decremented!' });
                        })
                    }
                })
                    .catch((err) => {
                        console.log(err);
                        res.status(501).send({ message: 'winners not found!' });
                    })
            }).catch((err) => {
                console.log(err);
                res.status(505).send({ message: 'level could not be ended!' });
            })
        }).catch((err) => {
            console.log(err);
            res.status(506).send({ message: 'level could not be found!' });
        })
    }
    catch {
        res.status(507).send({ message: 'finishMatch error!' });
    };
};

exports.finishMatch = (req, res) => {
    var players_count = 0;
    try {
        matches.findOne({
            where: {
                match_key: req.body.match_key
            }
        }).then(match => {
            console.log(req.body);
            match.update({
                end: true,
                winner_id: req.body.winner_id
            }).then(() => {
                if (match.player_IDs.split(',').length == 1) {
                    players_count = 1
                }
                else {
                    players_count = match.player_IDs.split(',').length - 1
                }
                if (req.body.winner_id) {
                    users.findOne(
                        {
                            where: {
                                id: req.body.winner_id
                            }
                        }
                    ).then(winner => {
                        winner.increment('balance', {
                            by: match.match_cost * players_count
                        }).then(() => {
                            res.status(200).send({ message: 'Match has been ended succesfully!' });
                        }).catch((err) => {
                            console.log(err);
                            res.status(502).send({ message: 'winners did not receive their winnings!' });
                        })
                    })
                        .catch((err) => {
                            console.log(err);
                            res.status(501).send({ message: 'winners not found!' });
                        })
                }
                users.findAll({
                    where: {
                        id: {
                            [Op.in]: match.player_IDs.split(','),
                            [Op.ne]: req.body.winner_id
                        }
                    }
                }).then(user_arr => {
                    user_arr.map(user => {
                        user.decrement('balance', {
                            by: match.match_cost
                        }).then(() => {
                            res.status(200).send({ message: 'Match has been ended succesfully!' });
                        }).catch((err) => {
                            console.log(err);
                            res.status(503).send({ message: 'Looser balance not decremented!' });
                        })
                    })
                }).catch((err) => {
                    console.log(err);
                    res.status(504).send({ message: 'Loosers not found!' });
                })
            }).catch((err) => {
                console.log(err);
                res.status(505).send({ message: 'Match could not be ended!' });
            })
        }).catch((err) => {
            console.log(err);
            res.status(506).send({ message: 'Match could not be found!' });
        })
    }
    catch {
        res.status(507).send({ message: 'finishMatch error!' });
    };
};


