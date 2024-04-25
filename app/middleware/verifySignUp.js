import db from "../models/index.js";
const ROLES = db.ROLES;
const User = db.user;

export const checkDuplicateEmail = (req, res, next) => {
  // Username
  try {

    if (req.body.email) {
      User.findOne({
        where: {
          email: req.body.email
        }
      }).then(user => {
        if (user) {
          res.status(401).send({
            message: "Email is already in use!"
          });
          return;
        }
        next();
      });

    }

  }
  catch {
    res.status(503).send({
      message: "Bad request!"
    });
  }
};

export const checkDuplicateUsername = (req, res, next) => {
  // Username
  try {
    if (req.body.username) {
      User.findOne({
        where: {
          username: req.body.username
        }
      }).then(user => {
        if (user) {
          res.status(400).send({
            message: "Username is already in use!"
          });
          return;
        }
        next()
      });
    }
    else {
      if (req.body.email) {
        User.findOne({
          where: {
            email: req.body.email
          }
        }).then(user => {
          if (user) {
            res.status(401).send({
              message: "Email is already in use!"
            });
            return;
          }

          next();
        });

      }
    }

  }
  catch {
    res.status(503).send({
      message: "Bad request!"
    });
  }
};

export const checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(405).send({
          message: "Failed! Role does not exist = " + req.body.roles[i]
        });
        return;
      }
    }
  }
  next();
};