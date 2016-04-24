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
  console.log(adminusername);
  req.checkBody('adminusername', 'Insert Username').notEmpty();

  var errors = req.validationErrors();

  if(errors){
    console.log(errors);
    res.render('addAdmin', {
      "errors": errors,
      "adminusername": adminusername
    });
  }

  users.findOne({'username': adminusername}, function(err, user){
    if(err){
      req.flash("No username was found. Go Back to site and enter a valid username");
      res.location('/addAdmin');
      res.redirect('/addAdmin');
    }
    if(!user){
      res.send("No username was found.Go Back to site and enter a valid username");
      res.location('/addAdmin');
      res.redirect('addAdmin');
    }
          else{
             users.update({username: adminusername},{ "$set": { role:  'Admin'}}, function(err, users){
          if(err){
            res.send('There was an issue submitting the post');
          }else{
            req.flash('success', 'Admin Added');
            res.location('/home');
            res.redirect('/home');
          }
      });
          }
        })

  })


      //Login Page get request
router.get('/login', function(req, res){
  res.render('login',{
    message: req.flash('error')
  });
});

      //Form post request for login
  router.post('/login', passport.authenticate('local',{failureRedirect: '/login', failureFlash: true}),
  function(req, res) {
    console.log('reached success');
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    req.flash('success', 'You are now logged in');
    res.redirect('/home');
  });


  //Serialize function determine what data from the user object should be stored in the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
    console.log('reached serializer');
  });

//In deserialize function that key is matched with in memory array / database or any data resource.
  passport.deserializeUser(function(id, done) {
    console.log('reached deserialize');
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new LocalStrategy(function(username, password, done){
  console.log("local strategy is being called");
  User.getUserByUsername(username, function(err, user){
    console.log(username);
    if(err) throw err;
    if(!user){
      return done(null, false, {message:'Incorrect User'});
    }
    User.comparePassword(password, user.password, function(err, isMatch){
      if (err) { return done(err); }
      if (isMatch) {
         console.log("is matched called");
        return done(null, user);
      }
      else{
        return done(null, false, {message: 'Invalid password'});
        console.log("failureFlash");
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

  console.log(email);
  console.log(password2);


  var errors = req.validationErrors();

/*
  signup.findOne({ username: username }, {}, function(err, user) {


    if(err)
      throw err;

    console.log('returned data ->' + user);

    if(user.password === password) {
      console.log('password matched!');

      var posts = db.get('posts');
      posts.find({},{},function(err, posts) {
        res.render('home', {
          "role": user.role,
          "id": user._id,
          "name": user.username,
          "posts": posts
        });
      });
    } else {
      console.log('password mismatch or user doesnt exist.');
      res.redirect('/login');
    }
  });

});

*/

  if(errors){
    console.log(errors);
    req.flash('error', errors)
    res.render('login',{
      errors: errors,
      username: username,
      emai: email,
      password: password,
      password2: password2
    });
  }

  /*
  else{
    var signup = db.get('signup');
    console.log('reached here')

    //addind data to database
    signup.insert({
      //"username": username,
      //"password":password
    }, function(err, post){
      if(err){
        res.send("there was an issue when inserting the data");
      } else{
        signup.find({ "username": username }, { password:1, _id:0, role:1});
              if(password = adminpassword) {
                console.log('admin');
              // check if user role is author or admin
              // if (role === 'admin')
              // render dashboard for admin
              // else if (role === 'author')
              // render dashboard for author
              // res.render('index', { role: 'admin' }
              // now role can be accessed in jade!
          }else{
        console.log("There are no errors");
        console.log(req.body.name);
        console.log(req.body.email);

        */

        else{
            //create new user from mongoose schema(model/user.js)
            var newUser = new User({
              username : username,
              email: email,
              password: password,
              role : "Member"
            });

            console.log("Reached here");

              //Create User
            User.createUser(newUser, function(err, user){
              if(err) throw err;
              console.log(user);
            });
            req.flash('success', 'You are now registered and may log in');
            console.log("Testing");
        }
        res.location('/home');
        res.redirect('/home');
      //});
    //})
  });
//});

router.get('/logout', function(req,res){
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/login');
});

module.exports = router;
