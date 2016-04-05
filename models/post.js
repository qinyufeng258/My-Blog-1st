var mongodb = require('./db');
//评论模块 用户名、评论该内容、时间、评论的文章id
function Post(username, post,id, time) {
	this.id = id;
	this.user = username;
	this.post = post;
	if (time) {
		this.time = time;
	} else {
		this.time = new Date();
	}
};
module.exports = Post;

Post.prototype.save = function save(callback) {
	// 存入 Mongodb 的文檔
	var post = {
		user: this.user,
		post: this.post,
		id: this.id,
		time: this.time
	};
	console.log(post);
	mongodb.open(function(err, db) {
		if (err) {
		  return callback(err);
		}
		
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex('id');
			
			collection.insert(post, {safe: true}, function(err, post) {
				mongodb.close();
				callback(err, post);
			});
		});
	});
};
//根据传入的文章id，取出对应下的评论s
Post.get = function get(id,callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
	
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			//查找id属性为参数id的文档，如果id为null则匹配全部
			var query = {};
			if (id) {
				query.id = id;
			}
			//此处为表单数量控制
			collection.find(query, {limit:30}).sort({time: -1}).toArray(function(err, docs) {
				mongodb.close();

				if (err) {
					callback(err, null);
				}

				var posts = [];
				
				docs.forEach(function(doc, index) {
					var post = new Post(doc.user, doc.post, doc.id,doc.time);
					posts.push(post);
				});

				callback(null, posts);
			});
		});
	});
};
