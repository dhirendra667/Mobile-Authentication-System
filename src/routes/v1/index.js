const express = require('express');

const authRouter = require('./auth_router');
const userRouter = require('./user_router');

const v1Router = express.Router();

v1Router.use('/auth', authRouter);
v1Router.use('/users', userRouter);

module.exports = v1Router;
