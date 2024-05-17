import { root as _root } from "../config/image.dir.config.js";

export function getImage(req, res) {
    let filepath = `storage/${req.params['section']}/${req.params['image']}`
    res.sendFile(filepath, { root: _root });
}

export function getGameImage(req, res) {
    let filepath = `storage/${req.params['section']}/${req.params['game']}/${req.params['image']}`
    res.sendFile(filepath, { root: _root });
}
