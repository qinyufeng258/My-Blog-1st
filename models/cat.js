var mongodb = require('./db');


function Cat(time,nums) {

	this.time = time;
	this.nums = nums;
	
};
module.exports = Cat;

Cat.prototype.save = function save(callback) {
	// 存入 Mongodb 的文檔
	var post = {
		time: this.time,
		nums: this.nums,
	};
	console.log("归档日期为："+post.time + "，文章数量为：" + post.nums);
	mongodb.open(function(err, db) {
		if (err) {
		  return callback(err);
		}
		
		db.collection('cat', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex('time');
			
			collection.insert(post, {safe:true},function(err, post) {
				mongodb.close();
				callback(err, post);
			});
		});
	});
};

Cat.prototype.update = function update(callback) {
	// 存入 Mongodb 的文檔
	var post = {
		time: this.time,
		nums: this.nums,
	};
	console.log("归档日期为："+post.time + "，文章数量为：" + post.nums);
	mongodb.open(function(err, db) {
		if (err) {
		  return callback(err);
		}
		
		db.collection('cat', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			
			
			collection.update({time:post.time}, {$set:{nums:post.nums}}, {safe:true}, function(err, post) {
				mongodb.close();
				
				callback(err, post);
			});
		});
	});
};




Cat.get = function get(a_id, callback) {
	
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		
		db.collection('cat', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			
			collection.findOne({time: a_id}, function(err, doc) {
                mongodb.close(); 
                if (doc) {
                     // 封装Article对象   
                    var cat = new  Cat(doc.time,doc.nums);
                    callback(err, cat);

                } else {
                    callback(err, null);
                } 
            });
			
		});
	});
};

Cat.getAll = function getAll(id, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
	
		db.collection('cat', function(err, collection) {
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
			collection.find(query).sort({time: -1}).toArray(function(err, docs) {
				mongodb.close();

				if (err) {
					callback(err, null);
				}

				var posts = [];
				
				docs.forEach(function(doc, index) {
					var cat = new  Cat(doc.time,doc.nums);
					posts.push(cat);
				});

				callback(null, posts);
			});

			
		});
	});
};







