const dotenv = require('dotenv').config();
const compression = require('compression');
const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
const app = express();

// init middlewares
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());

// init db
require('./dbs/init.mongodb');

// const { checkOverload } = require('./helpers/check.connect');
// checkOverload();
// init routes

app.get('/', (req, res, next) =>
  res.status(200).json({
    status: 'success',
    message: 'Hello world!!!',
  }),
);

// handling error

module.exports = app;
