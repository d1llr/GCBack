module.exports = {
  secret: "bezkoder-secret-key",
  // jwtExpiration: 3600,         // 1 hour
  // jwtRefreshExpiration: 86400, // 24 hours

  /* for test */
  // jwtExpiration: 86400,          // 1 day
  // jwtRefreshExpiration: 172800,  // 2 days

  jwtExpiration: 10,          // 1 day
  jwtRefreshExpiration: 3000,  // 2 days
};
