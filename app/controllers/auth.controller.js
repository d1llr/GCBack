const db = require("../models");
const config = require("../config/auth.config");
const { user: User, role: Role, refreshToken: RefreshToken } = db;

const Op = db.Sequelize.Op;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../utils/mail");
const { setCode, getCode } = require("../utils/redis");

exports.signup = (req, res) => {
  // Save User to Database
  console.log(req.body);
  User.create({
    name: req.body.name.trim(),
    username: req.body.username.trim(),
    email: req.body.email.trim(),
    wallet: null,
    balance: 0,
    password: bcrypt.hashSync(req.body.password, 8)
  })
    .then(user => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            res.send({ message: "User registered successfully!" });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          res.send({ message: "User registered successfully!" });
        });
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });

};


exports.sendCode = async (req, res) => {
  try {
    const { email } = req.body
    let code = Math.floor(Math.random() * 8888) + 1000
    await setCode(email, code).then(async () => {
      console.log('Succesfully saved code on redis');
      await sendEmail(
        email,
        'Confirm your account on PACGC.PW',
        `Your code confirmation is ${code}`
      ).then(() => {
        console.log(`Sending code[${code}] is success`);
        res.status(200).send({ message: 'Code send on your email' });
      }).catch(err => {
        console.log(err);
        res.status(404).send({ message: 'Retry later' })
      })
    })

  }
  catch {
    res.status(500).send({ message: 'register failed' });
  }
}

exports.checkCode = async (req, res) => {
  try {
    const { userCode, email } = req.body
    console.log(`got userCode ${userCode}`);
    await getCode(email).then(async (data) => {
      console.log(`redis code is ${data}`);
      if (userCode == data)
        res.status(200).send({ message: 'register could be done' });
      else res.status(400).send({ message: 'Code is invalid!' })
    }).catch(err => {
      console.log(err);
      res.status(404).send({ message: 'Retry later' })
    })

  }
  catch {
    res.status(500).send({ message: 'register failed' });
  }
}

exports.signin = (req, res) => {
  User.findOne({
    where: {
      [Op.or]: [{ username: req.body.username.trim() }, { email: req.body.username.trim() }]
    }
  })
    .then(async (user) => {
      if (!user) {
        return res.status(402).send({ message: "User Not found." });
      }

      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      const token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: config.jwtExpiration
      });

      let refreshToken = await RefreshToken.createToken(user);

      let authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }

        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          wallet: user.wallet,
          balance: user.balance,
          accessToken: token,
          refreshToken: refreshToken,
        });

      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    return res.status(420).json({ message: "Refresh Token is required!" });
  }

  try {
    let refreshToken = await RefreshToken.findOne({ where: { token: requestToken } });

    if (!refreshToken) {
      res.status(421).json({ message: "Refresh token is not in database!" });
      return;
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.destroy({ where: { id: refreshToken.id } });

      res.status(422).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }

    const user = await refreshToken.getUser();
    let newAccessToken = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: config.jwtExpiration,
    });
    console.warn(`user ${user.id} got new A/R tokens`);
    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};


