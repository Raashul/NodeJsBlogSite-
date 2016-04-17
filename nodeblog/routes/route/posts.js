

module.exports = function(app) {

	app.get('/posts/add', function(req, res){
		var categories = db.get('categories');
		categories.find({}, {}, function(err, categories){
			res.render('addpost', {
			'title': 'Add Post',
			'categories': categories
			});
		});
	});

	app.get('/posts/show/:id', function(req,res,next){
		var posts =db.get('posts');
		posts.findById(req.params.id, function(err, post){
			res.render('show', {
				'post': post
				
				});
		});
	});

	
}