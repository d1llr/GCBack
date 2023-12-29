const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models/index.js");
const api = db.api_key;


const verifyApiKey = (req, res, next) => {
    let token = req.headers["api"];
    if (!token) {
        return res.status(405).send({ message: "No token provided!" });
    }

    api.findOne({
        where: {
            api_key: token
        }
    })
        .then(founded => {
            next();
            return;
        })
        .catch(err => {
            return res.status(407).send({ message: "APIKEY ERROR" });
        })
};

const authAPI = {
    verifyApiKey: verifyApiKey
};
module.exports = authAPI;
