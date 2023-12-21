const config = require("../config/image.dir.config");

exports.getImage = (req, res) => {
    filepath = `storage/${req.params['section']}/${req.params['image']}`
    res.sendFile(filepath, { root: config.root });
};

exports.getGameImage = (req, res) => {
    filepath = `storage/${req.params['section']}/${req.params['game']}/${req.params['image']}`
    res.sendFile(filepath, { root: config.root });
};
