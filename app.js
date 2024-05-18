var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/sqlite.db',(err)=>{
  if(err){
    console.error(err.message);
  }
  else{
    console.log('Connected to the sqlite database.');
  }
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.post('/api', (req, res) => {
  let YMD = req.body.YMD;

  // 檢查 YMD 是否為有效的日期格式（簡單檢查）
  if (!/^\d{4}-\d{2}-\d{2}$/.test(YMD)) {
    res.status(400).send('Invalid date format. Use YYYY-MM-DD.');
    return;
  }

  const inputDate = new Date(YMD);
  const startDate = new Date('2024-04-19');
  const endDate = new Date('2024-05-18');

  if (inputDate < startDate || inputDate > endDate) {
    res.status(400).send('Date is out of range. Enter a date between 2024-04-19 and 2024-05-18.');
    return;
  }

  let sql = 'SELECT * FROM rice_price WHERE YMD = ?';
  db.all(sql, [YMD], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal Server Error');
      return;
    }
    if (rows.length === 0) {
      res.status(404).send('No data found for the given date.');
    } else {
      res.send(rows);
    }
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
