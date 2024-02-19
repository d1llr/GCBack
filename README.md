1.
```cd home```


ecosystem.config.js file mus

2.
Run this command to launch backend server in dev environment
```pm2 start ecosystem.config.js --only development ```

Run this command to launch backend server in production environment
```pm2 start ecosystem.config.js --only production ```

Run this command to launch backend server in production and development environment
```pm2 start ecosystem.config.js```





usefull command

```pm2 status```
```pm2 log [mode]``` (mode = production/development/%)
```pm2 stop --only [mode]``` (mode = production/development/%)
