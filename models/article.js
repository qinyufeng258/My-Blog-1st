var mongodb = require('./db');


//数据库存储的文章的路径，get函数从数据库获取路径后，从本地文件读取HTML内容
//数据库存储 文章路径、发布时间、文章标题、文章唯一ID
function Article(id, name, route, route_short,time,cat) {
	this.id = id;
	this.name = name;
	this.route = route;	
	this.route_short = route_short;
	if(cat){
		this.cat = cat;
	}
	else{
		this.cat = '默认分类';
	}
	this.time = time;
};
module.exports = Article;

Article.prototype.save = function save(callback) {
	// 存入 Mongodb 的文檔
	var post = {
		id: this.id,
		name: this.name,
		route: this.route,
		route_short: this.route_short,
		time: this.time,
		cat: this.cat, 
	};
	console.log(post);
	mongodb.open(function(err, db) {
		if (err) {
		  return callback(err);
		}
		
		db.collection('articles', function(err, collection) {
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

Article.prototype.update = function update(callback) {
	// 存入 Mongodb 的文檔
	var post = {
		id: this.id,
		name: this.name,
		route: this.route,
		route_short: this.route_short,
		time: this.time,
		cat: this.cat, 
	};
	console.log(post);
	mongodb.open(function(err, db) {
		if (err) {
		  return callback(err);
		}
		
		db.collection('articles', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex('id');
			
			collection.update({id:post.id}, {$set:{
				name:post.name,
				route:post.route,
				route_short:post.route_short,
				time: post.time,
				cat: post.cat

			}}, {safe:true}, function(err, post) {
				mongodb.close();
				
				callback(err, post);
			});
		});
	});
};



Article.get = function get(a_id, callback) {
	
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		
		db.collection('articles', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			
			collection.findOne({id: a_id}, function(err, doc) {
                mongodb.close(); 
                if (doc) {
                     // 封装Article对象   
                    var article = new Article(doc.id,doc.name,doc.route,doc.route_short,doc.time,doc.cat); 
                    callback(err, article);

                } else {
                    callback(err, null);
                } 
            });
			
		});
	});
};


Article.getAll = function getAll(id, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
	
		db.collection('articles', function(err, collection) {
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
			collection.find(query).sort({id: -1}).toArray(function(err, docs) {
				mongodb.close();

				if (err) {
					callback(err, null);
				}

				var posts = [];
				
				docs.forEach(function(doc, index) {
					var article = new Article(doc.id,doc.name,doc.route,doc.route_short,doc.time,doc.cat); 
					//console.log(article);
					//console.log("Hello if u see me, it means no error here!");
					posts.push(article);
				});

				callback(null, posts);
			});
			// collection.findOne({id: a_id}, function(err, doc) {
   //              mongodb.close(); 
   //              if (doc) {
   //                   // 封装Article对象   
   //                  var article = new Article(doc.id,doc.name,doc.route,doc.time); 
   //                  callback(err, article);
   //              } else {
   //                  callback(err, null);
   //              } 
   //          });
			
		});
	});
};



Article.getByDate = function getByDate(time,callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
	
		db.collection('articles', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			
			var query = {};
			if (time) {
				query.time = time;
			}

			
			collection.find(query).sort({time: -1}).toArray(function(err, docs) {
				mongodb.close();

				if (err) {
					callback(err, null);
				}

				var posts = [];
				
				docs.forEach(function(doc, index) {
					var article = new Article(doc.id,doc.name,doc.route,doc.route_short,doc.time,doc.cat); 
					//console.log(article);
					posts.push(article);
				});

				callback(null, posts);
			});
			// collection.findOne({id: a_id}, function(err, doc) {
   //              mongodb.close(); 
   //              if (doc) {
   //                   // 封装Article对象   
   //                  var article = new Article(doc.id,doc.name,doc.route,doc.time); 
   //                  callback(err, article);
   //              } else {
   //                  callback(err, null);
   //              } 
   //          });
			
		});
	});
};


Article.getByClass = function getByClass(cat,callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
	
		db.collection('articles', function(err, collection) {
			if (err) {
				mongodb.close();
				console.log("This is a test,if u see me ,means error here!" + err);
				return callback(err);
			}

			
			var query = {};
			if (cat) {
				query.cat = cat;
			}

			
			collection.find(query).sort({time: -1}).toArray(function(err, docs) {
				mongodb.close();

				if (err) {

					callback(err, null);
				}

				var posts = [];
				
				docs.forEach(function(doc, index) {		
					var article = new Article(doc.id,doc.name,doc.route,doc.route_short,doc.time,doc.cat); 
					
					posts.push(article);
				});

				callback(null, posts);
			});
			
		});
	});
};



