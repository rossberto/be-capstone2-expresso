const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

/***** Auxiliar Functions *****/
function validateEmployee(req, res, next) {
  const reqEmployee = req.body.employee;

  if (reqEmployee.name && reqEmployee.position && reqEmployee.wage) {
    next();
  } else {
    res.status(400).send();
  }
}

function getEmployeeValues(req, res, next) {
  const employee = req.body.employee;

  const values = {
    $name: employee.name,
    $position: employee.position,
    $wage: employee.wage
  };

  if (req.employeeId) {
    values.$id = req.employeeId;
  }

  req.values = values;
  next();
}

/***** Employee Routes Methods *****/
employeesRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Employee WHERE is_current_employee=1';
  db.all(sql, (err, rows) => {
    if (err) {next(err)}

    res.send({employees: rows});
  });
});

employeesRouter.post('/', validateEmployee, getEmployeeValues, (req, res, next) => {
  const newEmployee = req.body.employee;

  const sql = 'INSERT INTO Employee (name, position, wage) ' +
            'VALUES ($name, $position, $wage)';
  db.run(sql, req.values, function(err) {
    if (err) {next(err)}

    db.get(`SELECT * FROM Employee WHERE id=${this.lastID}`, (err, row) => {
      if (err) {next(err)}

      res.status(201).send({employee: row});
    });
  });
});

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  const sql = `SELECT * FROM Employee WHERE id=${employeeId}`;
  db.get(sql, (err, row) => {
    if (err) {next(err)}

    if (row) {
      req.employeeId = employeeId;
      req.employee = row;
      next();
    } else {
      res.status(404).send();
    }
  });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
  res.send({employee: req.employee});
});

employeesRouter.put('/:employeeId', validateEmployee, getEmployeeValues, (req, res, next) => {
  const updatedEmployee = req.body.employee;

  const sql = 'UPDATE Employee SET ' +
              'name=$name, ' +
              'position=$position, ' +
              'wage=$wage ' +
              'WHERE id=$id';
  db.run(sql, req.values, function(err) {
    if (err) {next(err)}

    db.get(`SELECT * FROM Employee WHERE id=${req.employeeId}`, (err, row) => {
      if (err) {next(err)}

      res.send({employee: row});
    });

  });
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
  const sql = 'UPDATE Employee ' +
              'SET is_current_employee=0 ' +
              'WHERE id=$id';
  db.run(sql, {$id: req.employeeId}, err => {
    if (err) {next(err)}

    db.get(`SELECT * FROM Employee WHERE id=${req.employeeId}`, (err, row) => {
      if (err) {next(err)}

      res.send({employee: row});
    });
  });
});

const timesheetsRouter = require('./timesheets.js');
employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);


module.exports = employeesRouter;
