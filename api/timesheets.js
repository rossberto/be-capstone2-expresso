const express = require('express');
const timesheetsRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

/***** Auxiliar Functions *****/
function validateTimesheet(req, res, next) {
  const newTimesheet = req.body.timesheet;

  if (newTimesheet.hours && newTimesheet.rate && newTimesheet.date) {
    const values = {
      $hours: newTimesheet.hours,
      $rate: newTimesheet.rate,
      $date: newTimesheet.date,
      $employeeId: req.employeeId
    };
    req.values = values;
    next();
  } else {
    res.status(400).send();
  }
}

/***** Timesheet Routes Methods *****/
timesheetsRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Timesheet WHERE employee_id=$employeeId';
  db.all(sql, {$employeeId: req.employeeId}, (err, rows) => {
    if (err) throw err;

    res.send({timesheets: rows});
  });
});

timesheetsRouter.post('/', validateTimesheet, (req, res, next) => {
  const newTimesheet = req.body.timesheet;

  const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id) ' +
              'VALUES ($hours, $rate, $date, $employeeId)';
  const values = {
    $hours: newTimesheet.hours,
    $rate: newTimesheet.rate,
    $date: newTimesheet.date,
    $employeeId: req.employeeId
  }

  db.run(sql, values, function(err) {
    if (err) throw err;

    db.get(`SELECT * FROM Timesheet WHERE id=${this.lastID}`, (err, row) => {
      if (err) throw err;

      res.status(201).send({timesheet: row});
    });
  });
});

timesheetsRouter.param('timesheetId', (req, res, next, id) => {
  db.get(`SELECT * FROM Timesheet WHERE id=${id}`, (err, row) => {
    if (err) throw err;

    if (row) {
      req.timesheetId = id;
      next();
    } else {
      res.status(404).send();
    }
  });
});

timesheetsRouter.put('/:timesheetId', validateTimesheet, (req, res, next) => {
  const updatedTimesheet = req.body.timesheet;

  const sql = 'UPDATE Timesheet SET ' +
              'hours=$hours, ' +
              'rate=$rate, ' +
              'date=$date ' +
              'WHERE id=$timesheetId';
  const values = {
    $hours: updatedTimesheet.hours,
    $rate: updatedTimesheet.rate,
    $date: updatedTimesheet.date,
    $timesheetId: req.timesheetId
  };

  db.run(sql, values, function(err) {
    if (err) throw err;

    db.get(`SELECT * FROM Timesheet WHERE id=${req.timesheetId}`, (err, row) => {
      if (err) throw err;

      if (row) {
        res.send({timesheet: row});
      } else {
        res.status(404).send();
      }
    });
  });
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  db.run(`DELETE FROM Timesheet WHERE id=${req.timesheetId}`, err => {
    if (err) throw err;

    res.status(204).send();
  });
});



















module.exports = timesheetsRouter;
