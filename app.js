var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
/*exported*/
var methodOverride = require('method-override');
var flash = require('connect-flash');
var settings = require('./settings');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

/*exported*/

var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

app.set('port', process.env.PORT || 3333);

//数据库链接
app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    /*db: settings.db,
    host: settings.host,
    port: settings.port*/
    url: 'mongodb://localhost/yffblog'
  })
}));

//视图助手
app.use(function(req,res,next){
    console.log("app.usr local");
    res.locals.user = req.session.user;
    res.locals.post = req.session.post;
    var error = req.flash('error');
    res.locals.error = error.length?error:null;

    var success = req.flash('success');
    res.locals.success = success.length?success:null;
    console.log('视图助手提示：'+res.locals.success);
    console.log('视图助手提示：'+res.locals.error);
    next();
});

app.use('/', routes);
//app.use('/users', users);














// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(app.get('port'));
module.exports = app;
