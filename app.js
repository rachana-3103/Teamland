const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const ejs = require('ejs');
const path = require('path');

const userRoutes = require('./routes/user.routes');
const questionRoutes = require('./routes/questionMaster.route');
const slackRoutes = require('./routes/slack.routes');
const gameRoutes = require('./routes/game.route')
const userPair = require('./routes/userPair.route');
const channelRoutes = require('./routes/channel.route');
const { errorHandler } = require('./middleware/errorHandler');

const { TOO_MANY_REQUESTS } = require('./helpers/messages');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    error: TOO_MANY_REQUESTS,
  },
});

const app = express();

const { getROLES } = require('./middleware/middleware');

getROLES();
require('./config/slack');

app.use(cors());
app.options('*', cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(logger('common'));
app.set('templates', path.join(__dirname, 'templates'));

//set view engine
app.set('view engine', 'ejs');
app.use('/', apiLimiter, userRoutes);
app.use('/admin', apiLimiter, questionRoutes);
app.use('/slack', apiLimiter, slackRoutes);
app.use('/game', apiLimiter, gameRoutes);
app.use('/userPair', apiLimiter, userPair);
app.use('/channel', apiLimiter, channelRoutes);
app.use('/api/v1/account', apiLimiter, userRoutes);
app.use(errorHandler);

module.exports = app;
