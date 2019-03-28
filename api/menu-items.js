const express = require('express');
const itemsRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

/***** Auxiliar Functions *****/

/***** Menu-Items Routes Methods *****/


module.exports = itemsRouter;
