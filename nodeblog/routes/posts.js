
var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var multer = require('multer');


var signup = db.get('signup');
var upload = multer({
 	dest: './public/images/uploads',
 	limits: {fileSize: 1000000, files:1},
	});

//addded code
var type = upload.single('mainimage')

router.get('/add', function(req, res){

	var categories = db.get('categories');
	categories.find({}, {}, function(err, categories){
		res.render('addpost', {
		'title': 'Add Post',
		'categories': categories
		});
	});
});

router.get('/show/:id', function(req,res,next){
	var posts =db.get('posts');
	posts.findById(req.params.id, function(err, post){
		res.render('show', {
			'post': post
			});
	});
});


//Edit Post
router.get('/edit/:id', function(req, res,next){
	var posts =db.get('posts');
	var categories = db.get('categories');

	posts.findById(req.params.id, function(err, post){
		res.render('editpost', {
			'post': post
			});
	});
	categories.find({}, {}, function(err, categories){
		res.render('addpost', {
		'title': 'Add Post',
		'categories': categories
		});
	});
});


//Edit Post get request.
router.get('/edit/:id', function(req, res,next){
	var posts =	db.get('posts');
	var categories = db.get('categories');

	posts.findById(req.params.id, function(err, post){
		res.render('editpost', {
			'post': post
			});
	});
	categories.find({}, {}, function(err, categories){
		res.render('addpost', {
		'title': 'Add Post',
		'categories': categories
		});
	});
});


//Form submit for Edit post
router.post('/edit/:id', type, function(req, res){

	var title     = req.body.title;
	var category  = req.body.category;
	var body      = req.body.body;
	var author    = req.body.author;
	var date 	  = new Date();
	//var id			= req.params.id;


	if(req.file){
		
		var mainImageOriginalImage		= req.file.originalname;
		var mainImageName 				= req.file.filename;
		var mainImageMime				= req.file.mimetype;
		var mainImagePath 				= req.file.path;
		var mainImageExt 				= req.file.extension;
		var mainImageSize 				= req.file.size;

	} else{
		var mainImageName = 'noimage.png';
		
	}

	//Form validation
	req.checkBody('title', 'Title field is required').notEmpty();
	req.checkBody('body', 'Body field is required');

	
	

	//Check Errors
	var errors = req.validationErrors();

	if(errors){
		
		res.render('editpost', {
			"errors": errors,
			"title": title,
			"body": body
		});
		
	}

	else{
		var posts = db.get('posts');

		posts.findById(req.params.id, function(err, post){

			
			if(err){
				req.flash("Error here");
				
			}else{
				//Submit to db
					posts.update({
							_id: req.params.id
						},
						{
							title: title,
							body: body,
							category: category,
							date: date,
							author: author,
							mainimage: mainImageName
					}, function(err, post){
						if(err){
							res.send('There was an issue submitting the post');
						} else{
							
							req.flash('success', 'Post Edited');
							res.location('/home');
							res.redirect('/home');
							
						}
					})
			}

		});

	}
});


		//Form submit from Add post.
router.post('/add', type, function(req, res){
	//get Form Values
	var title     = req.body.title;
	var category  = req.body.category;
	var body      = req.body.body;
	var author    = req.body.author;
	var date 	  = new Date();

	


	if(req.file){
		
		var mainImageOriginalImage		= req.file.originalname;
		var mainImageName 				= req.file.filename;
		var mainImageMime				= req.file.mimetype;
		var mainImagePath 				= req.file.path;
		var mainImageExt 				= req.file.extension;
		var mainImageSize 				= req.file.size;

	} else{
		var mainImageName = 'noimage.png';
		 
	}

	//Form validation
	req.checkBody('title', 'Title field is required').notEmpty();
	req.checkBody('body', 'Body field is required');

	

	//Check Errors
	var errors = req.validationErrors();

	if(errors){
		
		res.render('addpost', {
			"errors": errors,
			"title": title,
			"body": body
		});
		
	}

	else{

		var posts = db.get('posts');

		
		//Submit to db
		posts.insert({
			"title": title,
			"body": body,
			"category": category,
			"date": date,
			"author": author,
			"mainimage": mainImageName

		}, function(err, post){
			if(err){
				res.send('There was an issue submitting the post');
			} else{
				req.flash('success', 'Post submitted');
				res.location('/home');
				res.redirect('/home');
			}
		});
	}
});


		//Form Post Submit to add comments
router.post('/addcomment', function(req, res){

	if (!req.user){
	
		req.flash('error', 'Please log in to comment in the post');
		res.location('/login');
		res.redirect('/login');
	}
	else{
		//get Form Values
	var name     	= req.body.name;
	var email  		= req.body.email;
	var body      = req.body.body;
	var postid    = req.body.postid;
	var commentdate 	  = new Date();

	//Form validation
	req.checkBody('name', 'Name field is required').notEmpty();
	req.checkBody('body', 'Body field is required').notEmpty();
	req.checkBody('email', 'Email field is required').notEmpty();
	req.checkBody('email', 'Email is not formatted correctly').isEmail();

	//Check Errors
	var errors = req.validationErrors();

	if(errors){
		
		var posts = db.get('post');
		posts.findById(postid,function(err,post){
			res.render('show', {
			"errors": errors,
			"post": post
			});
		});
	}

	else{

		var comment = {"name":name, "email": email, "body": body, "commentdate":commentdate}
		var posts = db.get('posts');
		posts.update({
				"_id": postid,
		},{
			$push:{
				"comments":comment
			}
		},function(err, doc){
			if(err){
				throw err;
			}else{
				req.flash('success', 'Comment Added');
				res.location('/posts/show/'+postid);
				res.redirect('/posts/show/'+postid);
			}
		}
		)
	}
	}

});


module.exports = router;



