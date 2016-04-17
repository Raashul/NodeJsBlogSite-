var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');


router.get('/show/:category', function(req, res, next){
  var db = req.db;
  var posts = db.get('posts');
  posts.find({category : req.params.category},{}, function(err, posts){
    res.render('index',{
      "title": req.params.category,
      "posts": posts
    });
  });
});


/* GET home page. */
router.get('/add', function(req, res, next) {
  res.render('addcategory', {
    "title": "Add Category"
  });
});

router.post('/add', function(req, res){
  //get Form Values
  var title     = req.body.title;
  console.log("Read data from form");

  //Form validation
  req.checkBody('title', 'Title field is required').notEmpty();
  console.log(req.body.title);

  //Check Errors
  var errors = req.validationErrors();
  console.log(errors);

  if(errors){
    console.log("There were errors");
    console.log(errors);
    res.render('addcategory', {
      "errors": errors,
      "title": title,
    });
    console.log("step five");
  }

  else{

    var categories = db.get('categories');

    console.log("Reading database");
    //Submit to db
    categories.insert({
      "title": title,
    }, function(err, post){
      if(err){
        res.send('There was an issue submitting the category');
      } else{
        req.flash('success', 'Category submitted');
        res.location('/');
        res.redirect('/');
      }
    });
  }
});


module.exports = router;
