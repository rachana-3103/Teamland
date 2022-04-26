# Teamland-Backend
## _with CICD and Jest test framework_

[![Node.js CI](https://github.com/n23khan/teamland/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/n23khan/teamland/actions/workflows/ci.yml)

## Installation

This project requires [Node.js](https://nodejs.org/) v12+ to run.

Install the dependencies and devDependencies and start the server.

```sh
cd teamland
nano .env [add required variables -> I have added .env.local for example]
npm i
npm start
npm test [to run tests -> this is precisely written for Postgres DB, so you might wanna change package.json test scripts for that.]
If you want to remove CICD, just delete .github/workflows folder.
```
#
# How to start in production mode ?
```sh
sudo npm i -g pm2
sudo pm2 start production.json
sudo pm2 startup systemd
sudo pm2 save
```

# Thank you :)
#