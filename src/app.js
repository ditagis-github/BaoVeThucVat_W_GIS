var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(session({
	secret: 'faeb4453e5d14fe6f6d04637f78077c76c73d1b4',
	resave: true,
  saveUninitialized: true,
	})
);

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* ROUTER */
// var rtAccount = require('./routes/account');
// app.use('/',rtAccount)
const LoginRouter = require('./routes/login');
const MapRouter = require('./routes/map');
const AccountRouter = require('./routes/account');
var routerParams = {
  session:null
}
app.use('/',new LoginRouter(routerParams).router)
app.use('/map',new MapRouter(routerParams).router)
app.use('/account',new AccountRouter(routerParams).router)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
