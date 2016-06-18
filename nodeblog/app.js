  var express = require('express');
  var path = require('path');
  var favicon = require('serve-favicon');
  var logger = require('morgan');
  var expressValidator = require('express-validator');
  var cookieParser = require('cookie-parser');
  var session = require('express-session');
  var bodyParser = require('body-parser');
  var mongo = require('mongodb');
  var mongoose = require('mongoose');
  var db = require('monk')('localhost/nodeblog');
  var multer = require('multer');
  var flash = require('connect-flash');
  var passport = require('passport');
  var LocalStrategy = require('passport-local').Strategy;


  var routes = require('./routes/index');
  var posts = require('./routes/posts');
  var categories = require('./routes/categories');

  var bcrypt = require('bcryptjs');

  var app = express();

  app.locals.moment = require('moment');

  app.locals.truncateText = function(text, length){
      var truncatedText = text.substring(0, length);
      return truncatedText;
  }



  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  var upload = (multer({ dest: './uploads'}));

  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());


  //Handle express session
  app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave:true
  }));

  //passport
app.use(passport.initialize());
app.use(passport.session());


  //validator
  app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;

      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));


  app.use(express.static(path.join(__dirname, 'public')));


  //connect-flash
  app.use(flash());
  app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
  });

  //create global variable to check user
  app.get('*', function(req,res,next){
    res.locals.user = req.user || null;
    next();
  });

/*
      //create global variable to check user role. Admin or Not.
  app.get('*', function(req,res,next){
    res.locals.role = req.user.role || null;
    next();
  });

  */

  //Make our db accessible to our router
  app.use(function(req,res,next){
    req.db = db;
    next();
  });


   //Route files
        app.use('/', routes);
        app.use('/posts', posts);
        app.use('/categories', categories);

        app.get('posts/add', function(req, res){
          var categories = db.get('categories');
          categories.find({}, {}, function(err, categories){
            res.render('addpost', {
            'title': 'Add Post',
            'categories': categories
            });
          });

          console.log("step one");
        });



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


  module.exports = app;
