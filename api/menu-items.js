const express = require('express');
const itemsRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

/***** Auxiliar Functions *****/
function validateItem(req, res, next) {
  const reqItem = req.body.menuItem;

  if (reqItem.name && reqItem.inventory && reqItem.price ) {
    next();
  } else {
    res.status(400).send();
  }
}

function getItemValues(req, res, next) {
  const item = req.body.menuItem;

  const values = {
    $name: item.name,
    $description: item.description,
    $inventory: item.inventory,
    $price: item.price
  }

  if (req.itemId) {
    values.$id = req.itemId;
  } else {
    values.$menu_id = req.menuId;
  }

  req.values = values;
  next();
}

/***** Menu-Items Routes Methods *****/
itemsRouter.get('/', (req, res, next) => {
  console.log();
  db.all(`SELECT * FROM MenuItem WHERE menu_id=${req.menuId}`, (err, rows) => {
    if (err) throw err;

    res.send({menuItems: rows});
  });
});

itemsRouter.post('/', validateItem, getItemValues, (req, res, next) => {
  const reqItem = req.body.menuItem;

  const sql = 'INSERT INTO MenuItem ' +
              '(name, description, inventory, price, menu_id) VALUES ' +
              '($name, $description, $inventory, $price, $menu_id)';
  db.run(sql, req.values, function(err) {
    if (err) throw err;

    db.get(`SELECT * FROM MenuItem WHERE id=${this.lastID}`, (err, row) => {
      if (err) throw err;

      res.status(201).send({menuItem: row});
    });
  });
});

itemsRouter.param('menuItemId', (req, res, next, id) => {
  db.get(`SELECT * FROM MenuItem WHERE id=${id}`, (err, row) => {
    if (err) throw err;

    if (row) {
      req.itemId = id;
      req.item = row;
      next();
    } else {
      res.status(404).send();
    }
  });
});

itemsRouter.put('/:menuItemId', validateItem, getItemValues, (req, res, next) => {
  const reqItem = req.body.menuItem;

  const sql = 'UPDATE MenuItem SET ' +
              'name=$name, description=$description,' +
              'inventory=$inventory, price=$price ' +
              'WHERE id=$id';
  db.run(sql, req.values, err => {
    if (err) throw err;

    db.get(`SELECT * FROM MenuItem WHERE id=${req.itemId}`, (err, row) => {
      if (err) throw err;

      res.send({menuItem: row});
    });
  });
});

itemsRouter.delete('/:menuItemId', (req, res, next) => {
  db.run(`DELETE FROM MenuItem WHERE id=${req.itemId}`, err => {
    if (err) throw err;

    res.status(204).send();
  });
});















module.exports = itemsRouter;
