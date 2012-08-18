(function() {
	// 感兴趣者可以看看，不喜轻喷...
	// Propulsion是一个轻量级框架，要求所有代码在一个函数里...详见官网文档
	// 建议将官方文档结合起来看，各种框架函数不多解释什么的
	// 水平有限，多多见谅......
	
    var spr = PP.spr,rm = PP.rm,obj = PP.obj,snd = PP.snd,al = PP.al,global = PP.global,Alarm = PP.Alarm,collision = PP.collision,draw = PP.draw,init = PP.init,key = PP.key,load = PP.load,loop = PP.loop,mouse = PP.mouse,physics = PP.physics,Sound = PP.Sound,SoundEffect = PP.SoundEffect,Sprite = PP.Sprite,view = PP.view,walkDown = PP.walkDown;
	// 各种全局变量，不用管
	
		init('game', 1000, 480);
		loop.rate = 60;
		// 指定canvas和FPS
		
		spr.hoe = new Sprite('sprites/hoe.png', 1, 30, 30);
		spr.monitor = new Sprite('sprites/monitor.png', 1, 34, 34);
		spr.secretary = new Sprite('sprites/secretary.png', 1, 34, 34);
		spr.field_blank = new Sprite('sprites/field_blank.png', 1, 35, 35);
		spr.field_plantable = new Sprite('sprites/field_plantable.png', 1, 35, 35);
		spr.sun = new Sprite('sprites/sun.png', 2, 0, 0);
		spr.background = new Sprite('sprites/background_1000x480.png', 1, 0, 0);
		spr.button_menu = new Sprite('sprites/button_menu.png', 1, 70, 20);
		spr.button_start = new Sprite('sprites/button_start.png', 1, 70, 20);
		spr.button_about = new Sprite('sprites/button_about.png', 1, 70, 20);
		spr.html5mark = new Sprite('sprites/HTML5_Logo_64.png', 1, 0, 0);
		// 加载各种图片资源
		
		spr.button_menu.mask = [[ - 70, 20], [ - 70, -20], [70, -20], [70, 20]];
		spr.button_start.mask = [[ - 70, 20], [ - 70, -20], [70, -20], [70, 20]];
		spr.button_about.mask = [[ - 70, 20], [ - 70, -20], [70, -20], [70, 20]];
		spr.hoe.mask = [[35, 35], [ - 35, 35], [ - 35, -35], [35, -35]];
		spr.monitor.mask = [[ - 21, 33], [ - 21, -33], [21, -33], [21, 33]];
		spr.secretary.mask = [[ - 21, 33], [ - 21, -33], [21, -33], [21, 33]];
		spr.field_blank.mask = [[35, 35], [ - 35, 35], [ - 35, -35], [35, -35]];
		spr.field_plantable.mask = [[35, 35], [ - 35, 35], [ - 35, -35], [35, -35]];
		spr.sun.mask = [[0, 0], [170, 0], [170, 170], [0, 170]];
		// 设置图片的逻辑图形
		
		// 所有资源加载完成后运行下面这个主程序
		load(function() {
		
			// 锄头类，以下obj.*依次类推
			obj.hoe = {
				sprite: spr.hoe,
				mask: spr.hoe.mask,
				
				// t即为this，这种赋值是框架内置的
				initialize: function(t) {
					
					// 初始化：记录锄头的初始坐标，以及是否处于鼠标点击拖拽状态
					t.locationX = t.x;
					t.locationY = t.y;
					t.clicked = false;
				},
				
				// tick函数即每 1/FPS 秒运行一次的函数...
				tick: function(t) {
				
					// 引擎没有click函数，这个是官网给的替代方案...
					if (mouse.left.down && collision.point(t, mouse.x, mouse.y)) {
						t.clicked = !t.clicked;
						t.x = mouse.x;
						t.y = mouse.y;
						
						// 这是个分数平衡技巧...当时没时间改了，所以实用主义一下...
						global.score += 5;
					}
					if (t.clicked) {
					
						// 锄头追随鼠标
						t.x = mouse.x;
						t.y = mouse.y;
					} else {
					
						// 锄头回归原位
						t.x = t.locationX;
						t.y = t.locationY;
					}
				},
				
				// draw函数本质和tick一样，只是单独弄出来处理表现层，而tick处理逻辑层
				draw: function(t) {
					t.sprite.draw(t.x, t.y);
					draw.color = 'black';
					draw.font = 'normal normal bold 20px Arial';
					draw.text(0, 70, '  锄 头 ');
					if (collision.point(t, mouse.x, mouse.y)) {
						draw.text(0, 160, '1次100,');
						draw.text(0, 200, '如果余额');
						draw.text(0, 240, '不足100，');
						draw.text(0, 280, '也可欠费使用');
						draw.text(0, 320, '但要加收50...');
					}
				}
			};
			obj.field = {
				sprite: spr.field_blank,
				mask: spr.field_blank.mask,
				
				// 班长计时器，用以记录田地弹出班长的间隔时间以及班长消失时间
				monitorclock: function(t) {
					if (t.clocktime == 0) {
					
						// 计时器到0，产生一个相对随机坐标的班长
						t.monitor = loop.beget(obj.monitor, t.x + Math.random() * 60 - 30, t.y + Math.random() * 10 - 5);
						
						// 同时产生团支书的概率为0.12
						if (Math.random() > 0.88) {
							loop.beget(obj.secretary, t.x + Math.random() * 60 + 10, t.y + Math.random() * 10 - 30);
						}
						
						// 田地上有班长覆盖
						t.covered = true;
						
						// 再次初始化计时器
						t.clocktime = Math.floor(loop.rate * (Math.random() * 3 + 1));
					} else {
						t.clocktime -= 1;
					}
				},
				
				// 检测田地是否还被覆盖，这里只关心班长是否注销了，忽略了团支书
				check: function(t) {
					if (!t.monitor.registered) {
						t.covered = false;
					}
				},
				initialize: function(t) {
					t.covered = false;
					t.monitor = null;
					t.clocktime = Math.floor(loop.rate * (Math.random() * 3 + 1));
				},
				tick: function(t) {
				
					// 此if语句用于检测田地是否被开垦了
					if (t.sprite == spr.field_blank && collision.point(t, obj.hoeEntity.x, obj.hoeEntity.y)) {
						if (mouse.left.down) {
							t.sprite = spr.field_plantable;
							if (global.score < 100) {
								global.score -= 150;
							} else {
								global.score -= 100;
							}
						}
					}
					
					// 田地被开垦且上面没有班长，则启动计时器
					if (t.sprite == spr.field_plantable && !t.covered) {
						t.monitorclock(t);
					}
					if (t.covered) {
						t.check(t);
					}
				},
				draw: function(t) {
					t.sprite.draw(t.x, t.y);
				}
			};
			obj.monitor = {
				sprite: spr.monitor,
				mask: spr.monitor.mask,
				
				// 班长产生后的移动函数，基本上是个斜向上抛曲线
				jumpup: function(t) {
					t.x += t.vx;
					t.y += t.vy;
					t.vy += t.va;
					if (t.y >= t.locationY) {
						t.vx = 0;
						t.vy = 0;
						t.va = 0;
						t.jumped = true;
					}
				},
				initialize: function(t) {
					t.vx = Math.random() * 2 - 1;
					t.vy = -Math.random() - 1.5;
					t.locationX = t.x;
					t.locationY = t.y;
					
					// 重力
					t.va = 0.16;
					
					// 点击获得的分数
					t.score = 20;
					t.jumped = false;
					
					// 自动消失时间
					t.removetime = Math.floor(loop.rate * (Math.random() * 2 + 3));
				},
				tick: function(t) {
				
					// 这段应该好理解吧，不解释了...
					if (!t.jumped) t.jumpup(t);
					if (mouse.left.down && collision.point(t, mouse.x, mouse.y)) {
						loop.remove(t);
						global.score += t.score;
					}
					t.removetime -= 1;
					if (t.removetime == 0) {
						loop.remove(t);
					}
				},
				draw: function(t) {
					t.sprite.draw(t.x, t.y);
				}
			};
			
			// 团支书本来是可以做班长的子类的，但是由于框架的一些内部机制，继承语句会引发一些问题，所以就直接模仿着写了...
			obj.secretary = {
				sprite: spr.secretary,
				mask: spr.secretary.mask,
				jumpup: function(t) {
					t.x += t.vx;
					t.y += t.vy;
					t.vy += t.va;
					if (t.y >= t.locationY) {
						t.vx = 0;
						t.vy = 0;
						t.va = 0;
						t.jumped = true;
					}
				},
				initialize: function(t) {
					t.vx = Math.random() * 2 - 1;
					t.vy = -Math.random() - 1.5;
					t.locationX = t.x;
					t.locationY = t.y;
					t.va = 0.1;
					t.score = 55;
					t.jumped = false;
					t.removetime = Math.floor(loop.rate * (Math.random() * 2 + 3));
				},
				tick: function(t) {
					if (!t.jumped) t.jumpup(t);
					if (mouse.left.down && collision.point(t, mouse.x, mouse.y)) {
						loop.remove(t);
						global.score += t.score;
					}
					t.removetime -= 1;
					if (t.removetime == 0) {
						loop.remove(t);
					}
				},
				draw: function(t) {
					t.sprite.draw(t.x, t.y);
				}
			};
			
			obj.background = {
				
				// 图层：-1层，官方方法，不用管...
				depth: -1,
				sun: {
					sprite: spr.sun,
					mask: spr.sun.mask,
					initialize: function(t) {
						t.imgNumber = 0;
						
						// 不停地切换图片以达到动画的效果
						// Alarm函数相当于内置的计时器
						t.changetimer = new Alarm(function() {
							switch (t.imgNumber) {
							case 0:
								t.imgNumber = 1;
								break;
							case 1:
								t.imgNumber = 0;
								break;
							}
							t.changetimer.time = loop.rate * 0.5;
						});
						t.changetimer.time = loop.rate * 0.5;
					},
					draw: function(t) {
						t.sprite.draw(t.x, t.y, t.imgNumber);
					}
				},
				initialize: function(t) {
				
					// 为了让sun和background一起注册，就把sun写进来了，相当于background包含一个sun......
					loop.register(t.sun, 800, 0);
				},
				draw: function(t) {
					spr.background.draw(0, 0);
				}
			};
			obj.button = {
				sprite: spr.button_start,
				mask: spr.button_start.mask,
				initialize: function(t) {
					t.order = null;
				},
				tick: function(t) {
				
					// 可以看后面obj.menu的代码，根据button的order再来设定sprite
					switch (t.order) {
					case 'start':
						t.sprite = spr.button_start;
						break;
					case 'menu':
						t.sprite = spr.button_menu;
						break;
					case 'about':
						t.sprite = spr.button_about;
						break;
					}
					if (mouse.left.down && collision.point(t, mouse.x, mouse.y)) {
					
						// 不同的命令进入不同的loop.room
						switch (t.order) {
						case 'start':
							loop.room = rm.start;
							break;
						case 'menu':
							loop.room = rm.menu;
							break;
						case 'about':
							loop.room = rm.about;
							break;
						}
					}
				},
				draw: function(t) {
					t.sprite.draw(t.x, t.y);
				}
			};
			obj.score = {
			
				// 设置游戏时间为60秒
				initialize: function(t) {
					t.countdown = new Alarm(function() {
						loop.room = rm.gameover;
					});
					t.countdown.time = loop.rate * 60;
				},
				tick: function(t) {
				
					// 随便点一次都会减5分啊！
					if (mouse.left.down) {
						global.score -= 5;
					}
				},
				draw: function(t) {
					draw.color = 'black';
					draw.font = 'normal normal bold 20px Arial';
					draw.text(140, 110, '资金:' + global.score + '元');
					draw.text(290, 460, '1个班长=15元，1个团支书=50元');
					
					// 还剩5秒时用红色显示时间信息...
					if (t.countdown.time <= loop.rate * 5) {
						draw.color = 'red';
					}
					draw.font = 'normal normal bold 25px Arial';
					draw.text(425, 55, Math.ceil(t.countdown.time / loop.rate));
				}
			};
			
			// 后面这几个obj.menu,obj.about,obj.gameover更多的作用是把对应的rm.menu,rm.about,rm.gameover代码分解开，没有其他更多的意义
			obj.menu = {
				initialize: function(t) {
					obj.buttonStart = loop.beget(obj.button, 500, 250);
					obj.buttonStart.order = 'start';
					obj.buttonAbout = loop.beget(obj.button, 500, 360);
					obj.buttonAbout.order = 'about';
				},
				draw: function(t) {
					draw.color = 'black';
					draw.font = 'italic normal bold 70px Georgia,serif';
					draw.text(180, 200, '60 秒  收  获  班  长');
					draw.font = 'normal normal normal 20px Georgia,serif';
					draw.text(800, 200, 'v1.2');
				}
			};
			obj.about = {
				initialize: function(t) {
					obj.buttonMenu = loop.beget(obj.button, 880, 300);
					obj.buttonMenu.order = 'menu';
				},
				draw: function(t) {
					draw.font = 'normal normal bold 25px Arial';
					draw.text(200, 270, '开发引擎：Propulsion');
					draw.text(200, 340, '背景音乐来自：Machinarium');
					draw.font = 'normal normal bold 20px Arial';
					draw.text(175, 450, '自娱自乐的开源项目，纯粹的git学习实验品，欢迎使用...');
					spr.html5mark.draw(5, 5);
				}
			};
			obj.gameover = {
				initialize: function(t) {
					obj.buttonMenu = loop.beget(obj.button, 880, 300);
					obj.buttonMenu.order = 'menu';
				},
				draw: function(t) {
					draw.font = 'normal normal bold 30px Arial';
					draw.text(310, 180, '最终资金：' + global.score + '元');
				}
			};
			
			// rm.start就没有分解代码，而是直接写的
			rm.start = function() {
				loop.register(obj.background, 0, 0);
				loop.register(obj.score, 0, 0);
				global.score = 305;
				
				// 田地初始化
				obj.fieldEntity = new Array();
				for (var i = 0; i < 3; i++) {
					for (var j = 0; j < 5; j++) {
						obj.fieldEntity[5 * i + j] = loop.beget(obj.field, 175 + 130 * j, 160 + 110 * i);
						if (5 * i + j == 2 || 5 * i + j == 6 || 5 * i + j == 7 || 5 * i + j == 8 || 5 * i + j == 12) {
							obj.fieldEntity[5 * i + j].sprite = spr.field_plantable;
						}
					}
				}
				obj.hoeEntity = loop.register(obj.hoe, 30, 100);
				obj.buttonMenu = loop.beget(obj.button, 880, 300);
				obj.buttonMenu.order = 'menu';
			};
			rm.menu = function() {
				loop.register(obj.background, 0, 0);
				loop.register(obj.menu, 0, 0);
			};
			rm.about = function() {
				loop.register(obj.background, 0, 0);
				loop.register(obj.about, 0, 0);
			};
			rm.gameover = function() {
				loop.register(obj.background, 0, 0);
				loop.register(obj.gameover);
			};
			
			// 这两句也是必须的，大概就是游戏启动，然后进入菜单......
			loop.active = true;
			loop.room = rm.menu;
		});
}());