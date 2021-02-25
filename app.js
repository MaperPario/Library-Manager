var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var books = require('./routes/books');
const { sequelize } = require('./models')

var app = express();

(async () => {
  await sequelize.sync();
  try {
    await sequelize.authenticate();
    console.log('Connection Successful');
  } catch (error) {
    console.error('Connection Failed: ', error);
  }
})();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/books', books);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error();
  res.status(404);
  err.header = "Page Not Found"
  err.message = "Sorry! We couldn't find the page you were looking for!";
  res.render('page-not-found', { err });
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  if (err.status === 404) {
    res.status(404)
    res.render('page-not-found');
  } else {
  console.error(err.stack)
  res.status(500);
  console.log(err);
  res.render('error', {err})
  }
})

module.exports = app;
