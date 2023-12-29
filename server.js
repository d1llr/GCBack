const express = require("express");
const cors = require("cors");
require('dotenv').config({ path: `.env.${process.env.NODE_ENV.trim()}` })

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    // Проверка, что запрос пришел от разрешенного IP-адреса
    const allowedIps = ['192.168.1.1', 'https://pacgc.pw']; // замените на разрешенные IP-адреса
    if (!origin || allowedIps.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// database
const db = require("./app/models");
const Role = db.role;

db.sequelize.sync();
// force: true will drop the table if it already exists
// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Database with { force: true }');
//   initial();
// });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/games.routes')(app);
require('./app/routes/nft.routes')(app);
require('./app/routes/tournaments.routes')(app);
require('./app/routes/storage.routes')(app);
require('./app/routes/GameServer/user.game.routes')(app);
require('./app/routes/GameServer/game.client.routes')(app);
require('./app/routes/GameServer/match.game.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}. | ${process.env.NODE_ENV} |`);
});

function initial() {
  Role.create({
    id: 1,
    name: "user"
  });

  Role.create({
    id: 2,
    name: "moderator"
  });

  Role.create({
    id: 3,
    name: "admin"
  });
}