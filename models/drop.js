var mongodb = require('./db');


function Drop(name,nums) {

	this.name = name;
	this.nums = nums;
	
};
module.exports = Drop;

Drop.prototype.save = function save(callback) {
	// 存入 Mongodb 的文檔
	var post = {
		name: this.name,
		nums: this.nums,
	};
	console.log("分类名为："+post.name + "，对应该类的文章数量为：" + post.nums);
	mongodb.open(function(err, db) {
		if (err) {
		  return callback(err);
		}
		
		db.collection('drop', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex('name');
			
			collection.insert(post, {safe:true},function(err, post) {
				mongodb.close();
				callback(err, post);
			});
		});
	});
};

Drop.prototype.update = function update(callback) {
	// 存入 Mongodb 的文檔
	var post = {
		name: this.name,
		nums: this.nums,
	};
	console.log("分类名为："+post.name + "，对应该类的文章数量为：" + post.nums);
	mongodb.open(function(err, db) {
		if (err) {
		  return callback(err);
		}
		
		db.collection('drop', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			
			
			collection.update({name:post.name}, {$set:{nums:post.nums}}, {safe:true}, function(err, post) {
				mongodb.close();
				
				callback(err, post);
			});
		});
	});
};




Drop.get = function get(a_id, callback) {
	
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		
		db.collection('drop', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			
			collection.findOne({name: a_id}, function(err, doc) {
                mongodb.close(); 
                if (doc) {
                     // 封装Article对象   
                    var cat = new  Drop(doc.name,doc.nums);
                    callback(err, cat);

                } else {
                    callback(err, null);
                } 
            });
			
		});
	});
};

Drop.getAll = function getAll(id, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
	
		db.collection('drop', function(err, collection) {
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
			collection.find(query).sort({name: -1}).toArray(function(err, docs) {
				mongodb.close();

				if (err) {
					callback(err, null);
				}

				var posts = [];
				
				docs.forEach(function(doc, index) {
					var cat = new  Drop(doc.name,doc.nums);
					posts.push(cat);
				});

				callback(null, posts);
			});

			
		});
	});
};







