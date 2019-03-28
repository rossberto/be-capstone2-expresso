const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

let sql;

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS  Employee', (err) => {});

  sql = 'CREATE TABLE Employee (' +
        'id INTEGER PRIMARY KEY NOT NULL, ' +
        'name TEXT NOT NULL, ' +
        'position TEXT NOT NULL, ' +
        'wage INTEGER NOT NULL, ' +
        'is_current_employee INTEGER DEFAULT 1)';
  db.run(sql, (err) => {console.log(err);});

  db.run('DROP TABLE IF EXISTS Timesheet', (err) => {});
  sql = 'CREATE TABLE Timesheet (' +
        'id INTEGER PRIMARY KEY NOT NULL, ' +
        'hours INTEGER NOT NULL, ' +
        'rate INTEGER NOT NULL, ' +
        'date INTEGER NOT NULL, ' +
        'employee_id INTEGER NOT NULL, ' +
        'FOREIGN KEY(employee_id) REFERENCES Employee(id) )';
  db.run(sql, err => {console.log(err);});

  db.run('DROP TABLE IF EXISTS Menu');
  sql = 'CREATE TABLE Menu (' +
        'id INTEGER PRIMARY KEY NOT NULL, ' +
        'title TEXT NOT NULL) ';
  db.run(sql, err => {console.log(err);});

  db.run('DROP TABLE IF EXISTS MenuItem', (err) => {});
  sql = 'CREATE TABLE MenuItem (' +
        'id INTEGER PRIMARY KEY NOT NULL, ' +
        'name TEXT NOT NULL, ' +
        'description TEXT NOT NULL, ' +
        'inventory INTEGER NOT NULL, ' +
        'price INTEGER NOT NULL, ' +
        'menu_id INTEGER NOT NULL, ' +
        'FOREIGN KEY(menu_id) REFERENCES Menu(id) )';
  db.run(sql, err => {console.log(err);});
});
