const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

/***** Auxiliar Functions *****/
function validateMenu(req, res, next) {
  if (req.body.menu.title) {
    next();
  } else {
    res.status(400).send();
  }
}

function checkItems(req, res, next) {
  db.all(`SELECT * FROM MenuItem WHERE menu_id=${req.menuId}`, (err, rows) => {
    if (err) throw err;

    if (rows.length === 0) {
      next();
    } else {
      res.status(400).send();
    }
  });
}

/***** Menus Routes Methods *****/
menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (err, rows) => {
    if (err) throw err;

    res.send({menus: rows});
  });
});

menusRouter.post('/', validateMenu, (req, res, next) => {
  const reqMenu = req.body.menu;

  db.run(`INSERT INTO Menu (title) VALUES ("${reqMenu.title}")`, function(err) {
    if (err) throw err;

    db.get(`SELECT * FROM Menu WHERE id=${this.lastID}`, (err, row) => {
      if (err) throw err;

      res.status(201).send({menu: row});
    });
  });
});

menusRouter.param('menuId', (req, res, next, id) => {
  db.get(`SELECT * FROM Menu WHERE id=${id}`, (err, row) => {
    if (err) throw err;

    if (row) {
      req.menuId = id;
      req.menu = row;
      next();
    } else {
      res.status(404).send();
    }
  });
});

menusRouter.get('/:menuId', (req, res, next) => {
  res.send({menu: req.menu});
});

menusRouter.put('/:menuId', validateMenu, (req, res, next) => {
  const reqMenu = req.body.menu;

  const sql = 'UPDATE Menu SET ' +
              'title=$title WHERE id=$id';
  const values = {
    $title: reqMenu.title,
    $id: req.menuId
  }

  db.run(sql, values, err => {
    if (err) throw err;

    db.get(`SELECT * FROM Menu WHERE id=${req.menuId}`, (err, row) => {
      if (err) throw err;

      res.send({menu: row});
    });
  });
});

menusRouter.delete('/:menuId', checkItems, (req, res, next) => {
  db.run(`DELETE FROM Menu WHERE id=${req.menuId}`, err => {
    if (err) throw err;

    res.status(204).send();
  });
});

const itemsRouter = require('./menu-items.js');
menusRouter.use('/:menuId/menu-items', itemsRouter);


module.exports = menusRouter;
