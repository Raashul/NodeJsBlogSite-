var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var userdb = require('monk')('localhost/nodeauth');

var User = require('../models/user');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


/*
//GET home page. //
router.get('/', function(req, res, next) {
  var db = req.db;
  var posts = db.get('posts');
  posts.find({},{},function(err, posts){
    res.render('index',{
      "posts": posts
    });
  });
});

*/
router.get('/', function(req, res){
  res.redirect('/home');
});


router.get('/home', function(req, res, next) {
  var db = req.db;
  var posts = db.get('posts');
  posts.find({},{},function(err, posts){
    res.render('home',{
      "posts": posts
    });
  });
});


//Add Admin jade Get request
router.get('/addAdmin', function(req, res){
  res.render('addAdmin');
});


//Add Admin form post request
router.post('/addAdmin', function(req, res){
  var users = userdb.get('users');

  var adminusername = req.body.adminusername;
  
  req.checkBody('adminusername', 'Insert Username').notEmpty();

  var errors = req.validationErrors();

  if(errors){
    res.send("Go back and enter a username");

  }

  else{
    users.findOne({'username': adminusername}, function(err, user){
      if(err){
        res.send("No username was found.Go Back to site and enter a valid username");
      }
      else if(!user){
        res.send("No username was found.Go Back to site and enter a valid username");
      }
      else{
        users.update({username: adminusername},{ "$set": { role:  'Admin'}}, function(err, users){
        if(err){
        res.send('There was an issue submitting the post');
        } else{
          req.flash('success', 'Admin Added');
          res.location('/home');
          res.redirect('/home');
          }
      });
          }
    })

}

});

      //Login Page get request
router.get('/login', function(req, res){
  res.render('login',{
    message: req.flash('error')
  });
});

    //Form post request for login
router.post('/login', passport.authenticate('local',{failureRedirect: '/login', failureFlash: true}),
function(req, res) {
  
  // If this function gets called, authentication was successful.
  // `req.user` contains the authenticated user.

  req.flash('success', 'You are now logged in');
  res.redirect('/home');

});


  //Serialize function determine what data from the user object should be stored in the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
   
  });

//In deserialize function that key is matched with in memory array / database or any data resource.
  passport.deserializeUser(function(id, done) {
    
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new LocalStrategy(function(username, password, done){
  
  User.getUserByUsername(username, function(err, user){
    
    if(err) throw err;
    if(!user){
      
      return done(null, false, {message:'No User was found. Try Signing up'});
    }
    User.comparePassword(password, user.password, function(err, isMatch){
      if (err) {
        return done(err);
       }
      if (isMatch) {
         
        return done(null, user);
      }
      else{
        
        return done(null, false, {message: 'Invalid password. Try Again?'});
      }
    });
  });
}));

    //Sign up form submit
router.post('/dashboard', function(req,res) {
  var db = req.db;
  var signup = db.get('signup');

  var username  = req.body.username;
  var email     = req.body.email;
  var password  = req.body.password;
  var password2 = req.body.password2;


        //Data validation checking
  req.checkBody('username', 'Username field is required').notEmpty();
  req.checkBody('email', 'Email  is not valid').isEmail();
  req.checkBody('password', 'Password field is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(password);

 

  var errors = req.validationErrors();


  if(errors){
    
   
    res.render('login',{
      message: errors[0].msg,
      errors: errors,
      username: username,
      emai: email,
      password: password,
      password2: password2
    });

   
  }


  else{
      //create new user from mongoose schema(model/user.js)
      var newUser = new User({
        username : username,
        email: email,
        password: password,
        role : "Member"
      });

    

        //Create User
      User.createUser(newUser, function(err, user){
        if(err) throw err;
       
      });
      req.flash('success', 'You are now registered and may log in');
     
  }
  res.redirect('/home');
      //});
    //})
  });
//});

router.get('/logout', function(req,res){
  req.flash('success', 'You are now logged out');
  req.logout();
  res.redirect('/login');
});

module.exports = router;
