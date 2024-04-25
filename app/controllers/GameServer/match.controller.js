import db from "../../models/index.js";
const { matches: matches, user: users, levels: levels, activeTournaments: activeTournaments, tournamentsLevel: tournamentsLevel } = db;

import  Op  from "sequelize";



export async function startMatch(req, res) {
    try {
        console.log('Trying to start pvp match');
        var tournament_participants = []
        var tournament_key = ''
        // Проверка на участие пользователей в турнире
        await activeTournaments.findAll({
            where: {
                game: req.body.game_name
            }
        }).then(tours => {
            tours.map(tr => {
                let tournament_players = tr.players?.split(',')
                let match_players = req.body.player_IDs?.split(',')
                match_players.forEach(player => {
                    if (tournament_players.includes(player)) {
                        tournament_participants.push(player)
                    }
                });
                // Возможно место ошибки, когда участник, не участвующий в турнире, будет считатьтся как участник турнира
                tournament_key = tr.tournament_key
                //
            })
        })
            .catch(err => {
                console.log(err);
            })
        // создание матча
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
            }).catch(err => {
                console.log(err);
            })
    }
    catch {
        res.status(500).send({ message: 'startMatch error!' });
    };
}

// тут может быть баг с созданием, потому что нода ругается  TypeError: Cannot convert undefined or null to object
export async function startSingleMatch(req, res) {
    console.log(`Trying to start level ${req.body.level_name} in the ${req.body.game_name} by user ${req.body.player_id}`);
    try {
        // проверка на незаконченные уровни у пользователя, в случае если он ливнул, баланс все равно спишется после
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
                        user.update({
                            balance: user.balance - level.lose_cost
                        })
                    })
                });
            }).catch(err => {
                console.log(err);
            })
        console.log(`Starting level ${req.body.level_key}`);
        await levels.findOne({
            where: {
                level: req.body.level_name,
                player_ID: req.body.player_id,
                isWin: true,
                game: req.body.game_name
            }
        }).then((founded) => {
            if (!founded) {
                levels.create({
                    level: req.body.level_name,
                    win_cost: req.body.win_cost,
                    lose_cost: req.body.lose_cost,
                    player_ID: req.body.player_id,
                    game: req.body.game_name,
                    level_key: req.body.level_key,
                    isWin: 0,
                    end: false

                }).then(() => {
                    res.status(200).send({ message: 'Level has been created!' });
                    return null
                }).catch(err => {
                    res.status(404).send({ message: 'Something went wrong!' });
                })
                return null
            }
            else {
                res.status(500).send({ message: 'Level already exist!' });
            }
        })

        // Проверка на создание, если такой лвл есть, то вернется error, если лвла нет, то он создасться. 1 вариант практически невозможен, так как при начале каждого уровня идет проверка getLastLevel, своеобразный middleware
    }
    catch {
        res.status(200).send({ message: 'Level has been created!' });
    };
}

export async function startSingleTournamentMatch(req, res) {
    console.log(`Trying to start tournament level ${req.body.level_name} in the ${req.body.game_name} by user ${req.body.player_id}`);
    try {
        console.log(req.body);
        // проверка на незаконченные уровни у пользователя, в случае если он ливнул, баланс все равно спишется после
        await tournamentsLevel.findAll({
            where: {
                level: req.body.level_name,
                player_ID: req.body.player_id,
                end: false,
                tournament_key: req.body.tournament_key
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
                        user.update({
                            balance: user.balance - level.lose_cost
                        })
                    })
                });
            }).catch(err => {
                console.log(err);
            })
        console.log(`Starting tournament level ${req.body.level_key}`);
        await tournamentsLevel.findOne({
            where: {
                level: req.body.level_name,
                player_ID: req.body.player_id,
                isWin: true,
                game: req.body.game_name,
                tournament_key: req.body.tournament_key
            }
        }).then((founded) => {
            if (!founded) {
                tournamentsLevel.create({
                    level: req.body.level_name,
                    win_cost: req.body.win_cost,
                    lose_cost: req.body.lose_cost,
                    player_ID: req.body.player_id,
                    tournament_key: req.body.tournament_key,
                    game: req.body.game_name,
                    level_key: req.body.level_key,
                    isWin: 0
                }).then(() => {
                    res.status(200).send({ message: 'Level has been created!' });
                    return null
                }).catch(err => {
                    res.status(404).send({ message: 'Something went wrong!' });
                })
                return null
            }
            else {
                res.status(500).send({ message: 'Level already exist!' });
            }
        })

        // Проверка на создание, если такой лвл есть, то вернется error, если лвла нет, то он создасться. 1 вариант практически невозможен, так как при начале каждого уровня идет проверка getLastLevel, своеобразный middleware
    }
    catch {
        res.status(200).send({ message: 'Level has been created!' });
    };
}


export function getLastLevel(req, res) {
    try {
        console.log('Getting last level of the game [3 in row] {archived}');
        if (req.params['id'])
            levels.max('level', {
                where: {
                    player_ID: req.params['id'],
                    isWin: true,
                    end: true,
                    game: '3inRow'
                }
            })
                .then(level => {
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
}


export function getLastLevel_v2(req, res) {
    try {
        console.log(`Getting last level of the ${req.params['game_name']}`);
        if (req.params['id'] && req.params['game_name'])
            levels.max('level', {
                where: {
                    player_ID: req.params['id'],
                    isWin: true,
                    game: req.params['game_name'],
                    end: true
                }
            })
                .then(level => {
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
}

export function getLastLevelTournament(req, res) {
    try {
        console.log(`Getting last level of the ${req.params['game_name']}`);
        console.log(req.params);
        if (req.params['id'] && req.params['game_name'] && req.params['tournament_key'])
            tournamentsLevel.max('level', {
                where: {
                    player_ID: req.params['id'],
                    isWin: true,
                    game: req.params['game_name'],
                    tournament_key: req.params['tournament_key'],
                    end: true
                }
            })
                .then(level => {
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
}

export function finishSingleMatch(req, res) {
    console.log(`Ending level ${req.body.level_key}`);
    try {
        levels.findOne({
            where: {
                level_key: req.body.level_key,
                end: false
            }
        }).then(level => {
            level.update({
                end: true,
                isWin: req.body.isWin == 'False' ? false : true
            }).then(() => {
                users.findOne(
                    { where: { id: level.player_ID } }
                ).then(winner => {
                    if (req.body.isWin == 'False' ? false : true) {
                        console.log('win true');
                        winner.update({
                            balance: winner.balance + level.win_cost
                        }).then(() => {
                            res.status(200).send({ message: 'level has been ended succesfully!' });
                            return null

                        }).catch((err) => {
                            res.status(502).send({ message: 'winners did not receive their winnings!' });
                        })
                    }
                    else {
                        console.log('win false');

                        winner.update({
                            balance: winner.balance - level.lose_cost
                        }).then(() => {
                            res.status(200).send({ message: 'level has been ended succesfully!' });
                            return null

                        }).catch((err) => {
                            res.status(503).send({ message: 'Looser balance not decremented!' });
                        })

                    }
                    return null
                })
                    .catch((err) => {
                        res.status(501).send({ message: 'winners not found!' });
                    })
                return null
            }).catch((err) => {
                res.status(505).send({ message: 'level could not be ended!' });
            })
            return null
        }).catch((err) => {
            res.status(506).send({ message: 'level could not be found!' });
        })
    }
    catch {
        res.status(507).send({ message: 'finishMatch error!' });
    };
}


export function finishSingleTournamentsMatch(req, res) {
    console.log(`Ending level tournament ${req.body.level_key}`);
    try {
        tournamentsLevel.findOne({
            where: {
                level_key: req.body.level_key,
                tournament_key: req.body.tournament_key,
            }
        }).then(level => {
            level.update({
                end: true,
                isWin: req.body.isWin == 'False' ? false : true
            }).then(() => {
                users.findOne(
                    { where: { id: level.player_ID } }
                ).then(winner => {
                    if (req.body.isWin == 'False' ? false : true) {
                        console.log('win true');
                        winner.update({
                            balance: winner.balance + level.win_cost
                        }).then(() => {
                            res.status(200).send({ message: 'level has been ended succesfully!' });
                            return null

                        }).catch((err) => {
                            res.status(502).send({ message: 'winners did not receive their winnings!' });
                        })
                    }
                    else {
                        console.log('win false');

                        winner.update({
                            balance: winner.balance - level.lose_cost
                        }).then(() => {
                            res.status(200).send({ message: 'level has been ended succesfully!' });
                            return null

                        }).catch((err) => {
                            res.status(503).send({ message: 'Looser balance not decremented!' });
                        })

                    }
                    return null
                })
                    .catch((err) => {
                        res.status(501).send({ message: 'winners not found!' });
                    })
                return null
            }).catch((err) => {
                res.status(505).send({ message: 'level could not be ended!' });
            })
            return null
        }).catch((err) => {
            res.status(506).send({ message: 'level could not be found!' });
        })
    }
    catch {
        res.status(507).send({ message: 'finishMatch error!' });
    };
}


export function finishMatch(req, res) {
    console.log(`Ending pvp round ${req.body.match_key}`);
    var players_count = 0;
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
                        winner.update({
                            balance: winner.balance + (match.match_cost * players_count)
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
                        user.update({
                            balance: user.balance - match.match_cost
                        }).then(() => {

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
}


