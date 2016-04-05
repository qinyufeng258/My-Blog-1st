var express = require('express');
var router = express.Router();
var Post = require('../models/post.js');
var User = require('../models/user.js');
var Article = require('../models/article.js');
var Cat = require('../models/cat.js');//归档类
var Categ = require('../models/categ.js');//分类类
var Drop = require('../models/drop.js');//下拉列表类 我不能把分类和下拉列表的类放一起，因为我可以添加该列表项目，但是我不想为
//为该文章添加该分类
var crypto = require('crypto');
var fs = require('fs');
var util = require('util');
var formidable = require('formidable');
var url = require('url');
var path = require('path');
var uploadfoldername = 'uploadfiles';
var uploadfolderpath =  'public/' + uploadfoldername;

var server = 'localhost';
var port = 3000;
process.setMaxListeners(0);
/* GET home page. */
router.get("/me",function(req,res){
	 res.render("me",{
				title:"简历",
				article: 0,
	});
});
router.get("/about",function(req,res){
	Article.get("2016-03-24-16:42:32",function(err,article){
		 			if (err) {
		 			req.flash('error', err);
					return res.redirect('/');
				 }
				 res.render("about",{
				title:"About",
				article: article,
			});
	});
	
});

router.get('/archives/:archive_item?/:page?/:page_num?',function(req,res){

	Cat.getAll(null,function(err,cat){
			 	if (err) {
				 	req.flash('error', err);
					return res.redirect('/');
			 	}
			 	var date;
			 	if (req.params.archive_item == "") {
			 		date = cat[0].time;
			 	}
			 	else{
			 		date = req.params.archive_item
			 	}
			 	console.log("date +  " + date);
				Article.getByDate(date,function(err,article){
		 			if (err) {
		 			req.flash('error', err);
					return res.redirect('/');
				 }
		  	

				var pn;//得到对应的页数 默认主页为第1页
				if (!req.params.page_num) {
					pn = 1;
				}else{
				pn = parseInt(req.params.page_num);
				}

				var acts = [];
				 	var page_numbers;
				 	//得到页数
				 	if(article.length%6 != 0 ){
				 		page_numbers = Math.floor(article.length/ 6) + 1;
				 	}
				 	else{
				 		if(article.length<6){
				 			page_numbers = 1;
				 		}
				 		else{
				 			page_numbers = Math.floor(article.length/ 6 );
				 		}
				 		
				 	}
				 	console.log("archives/ page_numbers: " + page_numbers);
				 	console.log("archives/ pn: " + pn);
				 	//根据当前页，放入不同的文章
				 	if(pn == 1){
				 		//当页数为1时
				 		if(article.length<=6){
				 			//文章数量小于等于6时
				 			for(var i = (pn-1)*6;i< article.length;i++){
				 				
				 				acts.push(article[i]);
				 			}
				 		}
				 		else{
				 			//文章数量大于6时
				 			for(var i = (pn-1)*6;i< (pn-1)*6 + 6;i++){
				 				//不是最后一页，且文章数量 >6
				 				acts.push(article[i]);
				 			}
				 		}
				 	}
				 	else if(pn == page_numbers){
				 		//当页数为最后一页时
				 		if(article.length%6 == 0 ){
				 			//最后一页文章数量为6时
				 			for(var i = (pn-1)*6;i< (pn-1)*6 + 6;i++){
				 				acts.push(article[i]);
				 			}
				 		}
				 		else{
				 			//最后一页文章数量小于6时
				 			for(var i = (pn-1)*6;i< (pn-1)*6 + article.length%6 ;i++){
				 				console.log("asdasd   " + article[i]);
				 				acts.push(article[i]);
				 			}
				 		}
				 	}
				 	else{
				 		//当页数不是FIRST AND END时
				 		for(var i = (pn-1)*6;i< (pn-1)*6 + 6;i++){
				 			//不是最后一页，且文章数量 >6
				 			acts.push(article[i]);
				 		}
				 	}




			 	
				 res.render('archives',{
							title: "归档",
							acts: acts,
							cat: cat,
							article:article,
							
	
				  });
				
			 		
				});


	});
});
router.get('/edit',function(req,res){
	Drop.getAll(null,function(err,d){
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}	
		
			res.render('edit', { 
				title: 'Editor' ,
				drops:d,
				state:"new",
				article:0,
				
			});
		
	});
	
});
router.get('/favorites',function(req,res){
	//必须要做修改，不能大量加载文章

	Article.getAll(null,function(err,article){
			 if (err) {
			 	req.flash('error', err);
				return res.redirect('/');
			 }
			 Cat.getAll(null,function(err,cat){
			 	if (err) {
				 	req.flash('error', err);
					return res.redirect('/');
			 	}	
			 	Categ.getAll(null,function(err,categ){
				 	if (err) {
					 	req.flash('error', err);
						return res.redirect('/');
				 	}
				 	
				 	 res.render('favorites',{
						title: '收藏',
						article: article,
						cat: cat,
						categ:categ,
						
	
				   });
			 	});
			 	
		
			 	
				
			 });
			
			 
			 

		});
	 //res.render('index', { title: 'Express' });
});


router.get('/edit/:url',function(req,res){
	Drop.getAll(null,function(err,d){
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}	
		Article.get(req.params.url,function(err,article){
			
			res.render('edit', { 
				title: 'Fuck' ,
				drops:d,
				article:article,
				state:"old"
			});
		});
	
		
	});
	
});

// router.post('/edit',function(req,res){
// 	Drop.getAll(null,function(err,d){
// 		if (err) {
// 			req.flash('error', err);
// 			return res.redirect('/');
// 		}	
// 		Article.get(req.body.url,function(err,article){
			
// 			res.render('edit', { 
// 				title: 'Fuck' ,
// 				drops:d,
// 				article:article,
// 				state:"old"
// 			});
// 		});
	
		
// 	});
	
// });

router.get('/archive/:archive_item?/:page?/:page_num?',function(req,res){
	Article.getByDate(req.params.archive_item,function(err,article){
		 if (err) {
		 	req.flash('error', err);
			return res.redirect('/');
		 }
		  Cat.getAll(null,function(err,cat){
			 	if (err) {
				 	req.flash('error', err);
					return res.redirect('/');
			 	}	
			 	Categ.getAll(null,function(err,categ){
				 	if (err) {
					 	req.flash('error', err);
						return res.redirect('/');
				 	}
				 	Article.getAll(null,function(err,articles){
				 		if (err) {
					 	req.flash('error', err);
						return res.redirect('/');
				 		}

				 		var pn;//得到对应的页数 默认主页为第1页
					if (!req.params.page_num) {
						pn = 1;
					}else{
					pn = parseInt(req.params.page_num);
					}

					var acts = [];
					 	var page_numbers;
					 	//得到页数
					 	if(article.length%6 != 0 ){
					 		page_numbers = Math.floor(article.length/ 6) + 1;
					 	}
					 	else{
					 		if(article.length<6){
					 			page_numbers = 1;
					 		}
					 		else{
					 			page_numbers = Math.floor(article.length/ 6 );
					 		}
					 		
					 	}
					 	console.log("archives/ page_numbers: " + page_numbers);
					 	console.log("archives/ pn: " + pn);
					 	//根据当前页，放入不同的文章
					 	if(pn == 1){
					 		//当页数为1时
					 		if(article.length<=6){
					 			//文章数量小于等于6时
					 			for(var i = (pn-1)*6;i< article.length;i++){
					 				
					 				acts.push(article[i]);
					 			}
					 		}
					 		else{
					 			//文章数量大于6时
					 			for(var i = (pn-1)*6;i< (pn-1)*6 + 6;i++){
					 				//不是最后一页，且文章数量 >6
					 				acts.push(article[i]);
					 			}
					 		}
					 	}
					 	else if(pn == page_numbers){
					 		//当页数为最后一页时
					 		if(article.length%6 == 0 ){
					 			//最后一页文章数量为6时
					 			for(var i = (pn-1)*6;i< (pn-1)*6 + 6;i++){
					 				acts.push(article[i]);
					 			}
					 		}
					 		else{
					 			//最后一页文章数量小于6时
					 			for(var i = (pn-1)*6;i< (pn-1)*6 + article.length%6 ;i++){
					 				console.log("asdasd   " + article[i]);
					 				acts.push(article[i]);
					 			}
					 		}
					 	}
					 	else{
					 		//当页数不是FIRST AND END时
					 		for(var i = (pn-1)*6;i< (pn-1)*6 + 6;i++){
					 			//不是最后一页，且文章数量 >6
					 			acts.push(article[i]);
					 		}
					 	}


				 		res.render('archive',{
							title: "Cyberpunk",
							articles: articles,
							cat: cat,
							categ:categ,
							acts:acts,
							article:article,
	
				  		 });
				 	});	
				 	 
			 	});
			 		
		});


	});
});




router.get('/category/:category_item?/:page?/:page_num?',function(req,res){
	Article.getByClass(req.params.category_item,function(err,article){
		 if (err) {
		 	req.flash('error', "分类文章读取失败");
			return res.redirect('/');
		 }
		  Cat.getAll(null,function(err,cat){
			 	if (err) {
				 	req.flash('error', err);
					return res.redirect('/');
			 	}	
			 	Categ.getAll(null,function(err,categ){
				 	if (err) {
					 	req.flash('error', err);
						return res.redirect('/');
				 	}	
				 	Article.getAll(null,function(err,articles){
				 		if (err) {
					 	req.flash('error', err);
						return res.redirect('/');
				 		}

				 	var pn;//得到对应的页数 默认主页为第1页
				if (!req.params.page_num) {
					pn = 1;
				}else{
				pn = parseInt(req.params.page_num);
				}

				var acts = [];
				 	var page_numbers;
				 	//得到页数
				 	if(article.length%6 != 0 ){
				 		page_numbers = Math.floor(article.length/ 6) + 1;
				 	}
				 	else{
				 		if(article.length<6){
				 			page_numbers = 1;
				 		}
				 		else{
				 			page_numbers = Math.floor(article.length/ 6 );
				 		}
				 		
				 	}
				 	console.log("archives/ page_numbers: " + page_numbers);
				 	console.log("archives/ pn: " + pn);
				 	//根据当前页，放入不同的文章
				 	if(pn == 1){
				 		//当页数为1时
				 		if(article.length<=6){
				 			//文章数量小于等于6时
				 			for(var i = (pn-1)*6;i< article.length;i++){
				 				
				 				acts.push(article[i]);
				 			}
				 		}
				 		else{
				 			//文章数量大于6时
				 			for(var i = (pn-1)*6;i< (pn-1)*6 + 6;i++){
				 				//不是最后一页，且文章数量 >6
				 				acts.push(article[i]);
				 			}
				 		}
				 	}
				 	else if(pn == page_numbers){
				 		//当页数为最后一页时
				 		if(article.length%6 == 0 ){
				 			//最后一页文章数量为6时
				 			for(var i = (pn-1)*6;i< (pn-1)*6 + 6;i++){
				 				acts.push(article[i]);
				 			}
				 		}
				 		else{
				 			//最后一页文章数量小于6时
				 			for(var i = (pn-1)*6;i< (pn-1)*6 + article.length%6 ;i++){
				 				console.log("asdasd   " + article[i]);
				 				acts.push(article[i]);
				 			}
				 		}
				 	}
				 	else{
				 		//当页数不是FIRST AND END时
				 		for(var i = (pn-1)*6;i< (pn-1)*6 + 6;i++){
				 			//不是最后一页，且文章数量 >6
				 			acts.push(article[i]);
				 		}
				 	}



				 		res.render('category',{
						title: '分类',
						articles: articles,
						cat: cat,
						categ:categ,
						acts:acts,
						article:article
	
				   });
				 	});
				 	 
			 	});
			 		
		});


	});
});
router.get('/article/:id',function(req,res,next){
	Post.get(req.params.id,function(err,posts){
		 if (err) {
		 	req.flash('error', err);
			return res.redirect('/');
		 }
		 Article.get(req.params.id,function(err,article){
			 if (err) {
			 	req.flash('error', err); 
				return res.redirect('/');
			 }
			 Cat.getAll(null,function(err,cat){
			 	if (err) {
				 	req.flash('error', err);
					return res.redirect('/');
			 	}
			 	Categ.getAll(null,function(err,categ){
				 	if (err) {
					 	req.flash('error', err);
						return res.redirect('/');
				 	}	
				 	Article.getAll(null,function(err,all_acts){
				 		if (err) {
					 	req.flash('error', err);
						return res.redirect('/');
				 		}


				 		res.render('article',{
								title: "文章",
								article: article,
								comments: posts,
								categ:categ,
								cat: cat,
								all_acts:all_acts,
						
						});
				 	});
				 	
				 });	
			 	

			 });
			
			

		});
	});
	
});
router.post('/post_artcle',function(req,res){
	//啊啊啊啊，智障一样的代码，为啥这么多事件监听啊，必须等每个事件完成后才能做下一个事件啊！！
	//将除文章主体外的信息存储进数据库
	var time = new Date().Format("yyyy年MM月");
	var article = new Article(
		req.body.article_id,
		req.body.article_name,
		req.body.post,
		req.body.post_short,
		time,
		req.body.article_categ

	);

	Article.get(req.body.article_id,function(err,post){
		if (err) {
				req.flash('error', err);
				return res.redirect('/');
		}

		if(post!=null){
			//如果不为空，则更新数据
			//如果文章存在，则仅需要更新文章内容即可，其他不需要改变，直接保存。
			article.time  = post.time;
			article.update(function(err){
				if (err) {
					req.flash('error',err);
					return res.redirect('/');
				}
				req.flash('success','文章内容更新成功');
				var url = "article/" + req.body.article_id;
				console.log("编辑完毕后，向AJAX返回的URL为：" + url);
				res.send({
					url:url
				});

			});
		}
		else{
			//如果为空，则按照原来的方式新建数据
			Categ.get(req.body.article_categ,function(err,categ) {
		//从数据库获取上传的文章的分类是否存在，若存在则分类数量取出+1，否则则新创建
		if (categ!=null) {
			categ.nums++;
			categ.update(function(err){
				if (err) {
					req.flash('error',err);
					return res.redirect('/');
				}
				req.flash('success','文章分类更新成功');
				Cat.get(time,function(err,cat){
					//从数据库获取上传的文章的月份是否存在，若存在则文章数量取出+1，否则则新创建
					if(cat != null){
						//如果日期存在
						cat.nums ++;
						article.save(function(err){
							if (err) {
								req.flash('error',err);
								return res.redirect('/');
							}
							req.flash('success','文章存储成功');
							//保存归档日期
							cat.update(function(err){
								if (err) {
									req.flash('error',err);
									return res.redirect('/');
								}
								req.flash('success','归档日期更新成功');
								var url = "article/" + req.body.article_id;
									//var url = "/";
									 console.log("编辑完毕后，向AJAX返回的URL为：" + url);
									 res.send({
									 	url:url
								});
								
							});
						});
					}
					else{
						//如果日期不存在，就新建一个cat，初始num = 1
						cat = new Cat(time,1);
						article.save(function(err){
							if (err) {
								req.flash('error',err);
								return res.redirect('/');
							}
							req.flash('success','文章存储成功');
							//保存归档日期
							cat.save(function(err){
								if (err) {
									req.flash('error',err);
									return res.redirect('/');
								}
								req.flash('success','归档日期新建成功');
								var url = "article/" + req.body.article_id;
									 //var url = "/";
								console.log("编辑完毕后，向AJAX返回的URL为：" + url);
								res.send({
									 url:url
								});
								// Article.get(req.body.article_id,function(err,posts){
								// 	 if (err) {
								// 	 	req.flash('error', err);
								// 		return res.redirect('/');
								// 	 }
									 
									

								// });
								
							});
						});
					}
					
				});
			});




		}
		else{
			categ = new Categ(req.body.article_categ,1);
			categ.save(function(err){
				if (err) {
					req.flash('error',err);
					return res.redirect('/');
				}
				req.flash('success','文章分类新建成功');
				Cat.get(time,function(err,cat){
					//从数据库获取上传的文章的月份是否存在，若存在则文章数量取出+1，否则则新创建
					if(cat != null){
						//如果日期存在
						cat.nums ++;
						article.save(function(err){
							if (err) {
								req.flash('error',err);
								return res.redirect('/');
							}
							req.flash('success','文章存储成功');
							//保存归档日期
							cat.update(function(err){
								if (err) {
									req.flash('error',err);
									return res.redirect('/');
								}
								req.flash('success','归档日期更新成功');
								var url = "article/" + req.body.article_id;
									//var url = "/";
									 console.log("编辑完毕后，向AJAX返回的URL为：" + url);
									 res.send({
									 	url:url
								});
								
							});
						});
					}
					else{
						//如果日期不存在，就新建一个cat，初始num = 1
						cat = new Cat(time,1);
						article.save(function(err){
							if (err) {
								req.flash('error',err);
								return res.redirect('/');
							}
							req.flash('success','文章存储成功');
							//保存归档日期
							cat.save(function(err){
								if (err) {
									req.flash('error',err);
									return res.redirect('/');
								}
								req.flash('success','归档日期新建成功');
								var url = "article/" + req.body.article_id;
									 //var url = "/";
								console.log("编辑完毕后，向AJAX返回的URL为：" + url);
								res.send({
									 url:url
								});
							
								
							});
						});
					}
					
				});
			});	
		}
	});

		}
									 
									

	});
	
	

	console.log("文章摘要:" + req.body.post_short);
	console.log("文章分类:" + req.body.article_categ);
	// Categ.get(req.body.article_categ,function(err,categ) {
	// 	//从数据库获取上传的文章的分类是否存在，若存在则分类数量取出+1，否则则新创建
	// 	if (categ!=null) {
	// 		categ.nums++;
	// 		categ.update(function(err){
	// 			if (err) {
	// 				req.flash('error',err);
	// 				return res.redirect('/');
	// 			}
	// 			req.flash('success','文章分类更新成功');
	// 			Cat.get(time,function(err,cat){
	// 				//从数据库获取上传的文章的月份是否存在，若存在则文章数量取出+1，否则则新创建
	// 				if(cat != null){
	// 					//如果日期存在
	// 					cat.nums ++;
	// 					article.save(function(err){
	// 						if (err) {
	// 							req.flash('error',err);
	// 							return res.redirect('/');
	// 						}
	// 						req.flash('success','文章存储成功');
	// 						//保存归档日期
	// 						cat.update(function(err){
	// 							if (err) {
	// 								req.flash('error',err);
	// 								return res.redirect('/');
	// 							}
	// 							req.flash('success','归档日期更新成功');
	// 							var url = "article/" + req.body.article_id;
	// 								//var url = "/";
	// 								 console.log("编辑完毕后，向AJAX返回的URL为：" + url);
	// 								 res.send({
	// 								 	url:url
	// 							});
								
	// 						});
	// 					});
	// 				}
	// 				else{
	// 					//如果日期不存在，就新建一个cat，初始num = 1
	// 					cat = new Cat(time,1);
	// 					article.save(function(err){
	// 						if (err) {
	// 							req.flash('error',err);
	// 							return res.redirect('/');
	// 						}
	// 						req.flash('success','文章存储成功');
	// 						//保存归档日期
	// 						cat.save(function(err){
	// 							if (err) {
	// 								req.flash('error',err);
	// 								return res.redirect('/');
	// 							}
	// 							req.flash('success','归档日期新建成功');
	// 							var url = "article/" + req.body.article_id;
	// 								 //var url = "/";
	// 							console.log("编辑完毕后，向AJAX返回的URL为：" + url);
	// 							res.send({
	// 								 url:url
	// 							});
	// 							// Article.get(req.body.article_id,function(err,posts){
	// 							// 	 if (err) {
	// 							// 	 	req.flash('error', err);
	// 							// 		return res.redirect('/');
	// 							// 	 }
									 
									

	// 							// });
								
	// 						});
	// 					});
	// 				}
					
	// 			});
	// 		});




	// 	}
	// 	else{
	// 		categ = new Categ(req.body.article_categ,1);
	// 		categ.save(function(err){
	// 			if (err) {
	// 				req.flash('error',err);
	// 				return res.redirect('/');
	// 			}
	// 			req.flash('success','文章分类新建成功');
	// 			Cat.get(time,function(err,cat){
	// 				//从数据库获取上传的文章的月份是否存在，若存在则文章数量取出+1，否则则新创建
	// 				if(cat != null){
	// 					//如果日期存在
	// 					cat.nums ++;
	// 					article.save(function(err){
	// 						if (err) {
	// 							req.flash('error',err);
	// 							return res.redirect('/');
	// 						}
	// 						req.flash('success','文章存储成功');
	// 						//保存归档日期
	// 						cat.update(function(err){
	// 							if (err) {
	// 								req.flash('error',err);
	// 								return res.redirect('/');
	// 							}
	// 							req.flash('success','归档日期更新成功');
	// 							var url = "article/" + req.body.article_id;
	// 								//var url = "/";
	// 								 console.log("编辑完毕后，向AJAX返回的URL为：" + url);
	// 								 res.send({
	// 								 	url:url
	// 							});
								
	// 						});
	// 					});
	// 				}
	// 				else{
	// 					//如果日期不存在，就新建一个cat，初始num = 1
	// 					cat = new Cat(time,1);
	// 					article.save(function(err){
	// 						if (err) {
	// 							req.flash('error',err);
	// 							return res.redirect('/');
	// 						}
	// 						req.flash('success','文章存储成功');
	// 						//保存归档日期
	// 						cat.save(function(err){
	// 							if (err) {
	// 								req.flash('error',err);
	// 								return res.redirect('/');
	// 							}
	// 							req.flash('success','归档日期新建成功');
	// 							var url = "article/" + req.body.article_id;
	// 								 //var url = "/";
	// 							console.log("编辑完毕后，向AJAX返回的URL为：" + url);
	// 							res.send({
	// 								 url:url
	// 							});
	// 							// Article.get(req.body.article_id,function(err,posts){
	// 							// 	 if (err) {
	// 							// 	 	req.flash('error', err);
	// 							// 		return res.redirect('/');
	// 							// 	 }
									 
									

	// 							// });
								
	// 						});
	// 					});
	// 				}
					
	// 			});
	// 		});	
	// 	}
	// });


		
});

router.post('/post',function(req,res){
	//不需要登录，获取用户输入的用户名 + 评论 + 文章id，存储到数据库后重定向到本页面
	//console.log("asdsad" + req.body.input_id);
	
	var post = new Post(req.body.input_name,req.body.input_comment,req.body.input_id);

	post.save(function(err){
		if (err) {
			req.flash('error',err);
			return res.redirect('/');
		}
		req.flash('success','发表成功');

		res.redirect('/article/' +  req.body.input_id);

	});

});
router.get('/reg',checkNotLogin);
router.get('/reg',function(req,res){
	
	res.render('reg',{
		title:'用户注册',
		article: 0,
	});
});
router.post('/reg',checkNotLogin);
router.post('/reg',function(req,res){
	// //校验用户两次输入的口令是否一致
	// if(req.body['repeat_password'] != req.body['password'] ){
	// 	req.flash('error','两次口令输入不一致');
	// 	return res.redirect('/reg');
	// 	//是重新定位到注册页面，即刷新
	// }

	// //生产口令的散列值
	// var md5 = crypto.createHash('md5');
	// var password = md5.update(req.body.password).digest('base64');

	// var newUser = new User({
	// 	name : req.body.username,
	// 	password : password

	// });

	// //检查用户名是否存在
	// User.get(newUser.name,function(err,user){
	// 	if(user){
	// 		err = '用户名已存在';
	// 	}
	// 	if(err){
	// 		req.flash('error',err);
	// 		return res.redirect('/reg');

	// 	}
	// 	//用户名唯一、口令一致（以后应该还会检查用户名规范和口令强度）
	// 	//新增该用户名
	// 	newUser.save(function(err){
	// 		if (err) {
	// 			req.flash('error',err);
	// 			return res.redirect('/reg');
	// 		}
	// 		req.session.user = newUser;
	// 		req.flash('success','注册成功');
	// 		res.redirect('/article');
	// 	});

	// });

});
router.get('/login',checkNotLogin);
router.get('/login',function(req,res){
	
	res.render('login',{
		title : '用户登录',
		article: 0,
	});
});
router.post('/login',checkNotLogin);
router.post('/login',function(req,res){
	//根据密码生成MD5校验码
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	User.get(req.body.username,function(err,user){
		if(!user){
			req.flash('error','用户名不存在');
			return res.redirect('/login');
		}
		if(user.password!= password){
			req.flash('error','口令错误！');
			return res.redirect('/login');
		}
		req.session.user = user;
		req.flash('success','登录成功');
		res.redirect('/');
	});


});
router.get('/loginout',checkLogin);
router.get('/logout',function(req,res){
	req.session.user = null;
	req.flash('success','登出成功');
	res.redirect('/');
});

router.post('/upload',function(req,res,next){
	// 使用第三方的 formidable 插件初始化一个 form 对象
		var form = new formidable.IncomingForm();

		// 处理 request
		form.parse(req, function (err, fields, files) {
			if (err) {
				return console.log('formidable, form.parse err');
			}

			console.log('formidable, form.parse ok');

			var item;

			// 计算 files 长度
			var length = 0;
			for (item in files) {
				length++;
			}
			if (length === 0) {
				console.log('files no data');
				return;
			}

			for (item in files) {
				var file = files[item];
				// formidable 会将上传的文件存储为一个临时文件，现在获取这个文件的目录
				var tempfilepath = file.path;
				// 获取文件类型
				var type = file.type;

				// 获取文件名，并根据文件名获取扩展名
				var filename = file.name;
				var extname = filename.lastIndexOf('.') >= 0
								? filename.slice(filename.lastIndexOf('.') - filename.length)
								: '';
				// 文件名没有扩展名时候，则从文件类型中取扩展名
				if (extname === '' && type.indexOf('/') >= 0) {
					extname = '.' + type.split('/')[1];
				}
				// 将文件名重新赋值为一个随机数（避免文件重名）
				filename = Math.random().toString().slice(2) + extname;

				// 构建将要存储的文件的路径
				var filenewpath = uploadfolderpath + '/' + filename;

				console.log("文件名："+ filenewpath);
				// 将临时文件保存为正式的文件
				fs.rename(tempfilepath, filenewpath, function (err) {
					// 存储结果
					var result = '';

					if (err) {
						// 发生错误
						console.log('fs.rename err');
						result = 'error|save error';
					} else {
						// 保存成功
						console.log('fs.rename done');
						// 拼接图片url地址
						result = 'http://' + server + ':' + port + '/uploadfiles/' + filename;


					}
					console.log("返回结果："+ result);
					// 返回结果
					//res.render("edit",{result:result});
					res.send(result);
				}); // fs.rename
			} // for in 
		});
});
router.post('/drop',function(req,res,next){

	var d = req.body.drop;


	var drop = new Drop(d,1);
	drop.save(function(err){
		if (err) {
			req.flash('error',err);
			return res.redirect('/');
		}
		req.flash('success','添加新下拉分类成功');
		
		var url = "/edit";
		console.log("编辑完毕后，向AJAX返回的URL为：" + url);
		res.send({
			 url:url
		});

					
	});

});

router.get('/:page?/:page_num?', function(req, res, next) {

	//必须要做修改，不能大量加载文章
	var pn;//得到对应的页数 默认主页为第1页
	if (!req.params.page_num) {
		pn = 1;
	}else{
		pn = parseInt(req.params.page_num);
	}
	

	Article.getAll(null,function(err,article){
			 if (err) {
			 	req.flash('error', err);
				return res.redirect('/');
			 }
			 Cat.getAll(null,function(err,cat){
			 	if (err) {
				 	req.flash('error', err);
					return res.redirect('/');
			 	}	
			 	Categ.getAll(null,function(err,categ){
				 	if (err) {
					 	req.flash('error', err);
						return res.redirect('/');
				 	}
				 	var acts = [];
				 	var page_numbers;
				 	//得到页数
				 	if(article.length%6 != 0 ){
				 		page_numbers = Math.floor(article.length/ 6) + 1;
				 	}
				 	else{
				 		if(article.length<6){
				 			page_numbers = 1;
				 		}
				 		else{
				 			page_numbers = Math.floor(article.length/ 6 );
				 		}
				 		
				 	}
				 	console.log("page_numbers: " + page_numbers);
				 	console.log("pn: " + pn);
				 	//根据当前页，放入不同的文章
				 	if(pn == 1){
				 		//当页数为1时
				 		if(article.length<=6){
				 			//文章数量小于等于6时
				 			for(var i = (pn-1)*6;i< article.length;i++){
				 				
				 				acts.push(article[i]);
				 			}
				 		}
				 		else{
				 			//文章数量大于6时
				 			for(var i = (pn-1)*6;i< (pn-1)*6 + 6;i++){
				 				//不是最后一页，且文章数量 >6
				 				acts.push(article[i]);
				 			}
				 		}
				 	}
				 	else if(pn == page_numbers){
				 		//当页数为最后一页时
				 		if(article.length%6 == 0 ){
				 			//最后一页文章数量为6时
				 			for(var i = (pn-1)*6;i< (pn-1)*6 + 6;i++){
				 				acts.push(article[i]);
				 			}
				 		}
				 		else{
				 			//最后一页文章数量小于6时
				 			for(var i = (pn-1)*6;i< (pn-1)*6 + article.length%6 ;i++){
				 				console.log("asdasd   " + article[i]);
				 				acts.push(article[i]);
				 			}
				 		}
				 	}
				 	else{
				 		//当页数不是FIRST AND END时
				 		for(var i = (pn-1)*6;i< (pn-1)*6 + 6;i++){
				 			//不是最后一页，且文章数量 >6
				 			acts.push(article[i]);
				 		}
				 	}
				 	

				 	
				 	
				 	 res.render('index',{
						title: 'Cyberpunk',
						article: article,
						cat: cat,
						categ:categ,
						acts:acts,
	
				   });
			 	});
			 	
		
			 	
				
			 });
			
			 
			 

		});
	 //res.render('index', { title: 'Express' });
});

function checkNotLogin(req,res,next){
	if(req.session.user){
		req.flash('error','已登录');
		res.redirect('/');
	}
	next();
}
function checkLogin(req,res,next){
	if(!req.session.user){
		req.flash('error','未登录');
		res.redirect('/login');
	}
	next();
}
Date.prototype.Format = function(fmt)   
		{ //author: meizz   
		  var o = {   
		    "M+" : this.getMonth()+1,                 //月份       
		  };   
		  if(/(y+)/.test(fmt))   
		    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
		  for(var k in o)   
		    if(new RegExp("("+ k +")").test(fmt))   
		  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
		  return fmt;   
} 
module.exports = router;
