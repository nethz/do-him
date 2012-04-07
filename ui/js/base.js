;(function() {
	/**
	 * 改这边的代码即可，无需考虑点击事件
	 * 只需要根据函数名添加相应的功能
	 */
	this.init = function() {
		/**
		 * 以下代码仅供测试，可以无视，最终发布时必须删除
		 */
		 /*
		$event($i('Stage'), 'click', function() {
			new Dialog('Pause', {
				width : 300,
				height : 'auto'
			});
		});
		cout(CustNum(12345));
		*/

		/**
		 * @TODO:
		 * 初始化代码
		 */
		new Stage({//创建舞台，此操作是必须的
			width : 800,
			height : 600
		});
		//。。。。
	};
	this.gStart = function(from) {
		$dialog[from].close();

		game.start();
$css($$('.time'), 'display', 'block');
$css($$('.cur-score'), 'display', 'block');
$css($$('.hi-score'), 'display', 'block');

		/**
		 * from参数可能是：
		 * from == 'Start'开始菜单
		 * from == 'Pause'暂停菜单
		 * from == 'GameOver'游戏结束菜单
		 * 不同的from参数，相应的代码可能不同
		 * @TODO:
		 * 添加对游戏操作的代码
		 */
	};
	this.gContinue = function() {
		$dialog['Pause'].close();

		game.pausing=false;
		game.pausemenu=null;
		/**
		 * @TODO:
		 * 添加返回游戏时需要的操作
		 */
	};
	this.gPause = function(from) {
		game.pausemenu=new Dialog('Pause', {
			width : 300,
			height : 'auto'
		});
		game.pausing=true;

		/**
		 * @TODO:
		 * 添加暂停游戏的操作
		 */
	};
	this.gExit = function(from) {
		window.location.reload();
	};

	this.loading = function(per) {
		$css($$('#Loading .loading'), 'width', per + '%');
	};
	
})(); (function() {
})(); (function() {
	/**
	 * 以下代码无需改动，暂时只支持高级浏览器
	 */
	this.$dialog = {};
	this.$ = function(selector, context) {
		var context = context || document;
		return context.querySelectorAll(selector);
	};
	this.$$ = function(selector, context) {
		var context = context || document;
		return context.querySelector(selector);
	};
	this.$i = function(id) {
		return document.getElementById(id);
	};
	this.$c = function(cls, context) {
		var context = context || document;
		return context.getElementsByClassName(cls);
	};
	this.cout = function(content) {
		console.info(content);
	};
	this.clog = function(content) {
		console.log(content);
	};
	this.$addClass = function(element, cls) {
		var current = element.getAttribute('class').split(' ');
		for(var i = 0, s = current.length; i < s; i++) {
			if(current[i] == cls)
				return false;
		}
		current.push(cls);
		element.setAttribute('class', current.join(' '));
	};
	this.$removeClass = function(element, cls) {
		var current = element.getAttribute('class').split(' ');
		for(var i = 0, s = current.length; i < s; i++) {
			if(current[i] == cls)
				current[i] = '';
		}
		element.setAttribute('class', current.join(' '));
	};
	this.$event = function(element, type, callback, useCapture) {
		element.addEventListener(type, callback, useCapture);
	};
	this.$css = function(element, name, value) {
		if(arguments.length == 2) {
			if( typeof (arguments[1]) == 'string') {
				return element.style.getPropertyValue(name);
			}
			for(var key in arguments[1]) {
				element.style.setProperty(key, arguments[1][key]);
			}
			return null;
		}
		if(arguments.length == 3) {
			return element.style.setProperty(name, value);
		}
	};
	this.Stage = function(options) {
		var _this = this;
		var element = this.element = $$('#Stage');

		var width = this.width = options.width;
		var height = this.height = options.height;
		$css(element, {
			width : width + 'px',
			height : height + 'px'
		});

		/*
		$event(window, 'resize', function() {
			_this.relocate();
		});
		$event(window, 'load', function() {
			_this.relocate();
		});
		this.relocate();
		*/
	};
	Stage.prototype.relocate = function() {
		var top = (window.innerHeight - this.height) / 2;
		var left = (window.innerWidth - this.width) / 2;
		$css(this.element, {
			'left' : (left > 0 ? left : 0) + 'px',
			'top' : (top > 0 ? top : 0) + 'px'
		});
	};
	this.Dialog = function(id, options) {
		var _this = this;
		var id = this.id = id;
		var element = this.element = $$('#' + id);
		var dialog = this.dialog = element.querySelector('.popup');
		var width = this.width = options.width;
		var height = this.height = options.height;
		if(id == 'Start') {
			var rl = '';
			for(var i = 0; i < 5; i++) {
				//rl += "<li><em>" + i + "</em><strong>" + i + "</strong></li>";
				rl += "<li><em>" + localStorage.getItem('name' + i) + "</em><strong>" + localStorage.getItem('score' + i) + "</strong></li>";
			}
			//dialog.querySelector('.rank').innerHTML = rl;
		}
		if(id == 'GameOver') {
			dialog.querySelector('.ysnum').innerHTML = localStorage.getItem('yourScore');
			
		}
		$css(element, 'display', 'block');
		$css(dialog, {
			width : width + 'px',
			height : height + 'px'
		});
		$event(window, 'resize', function() {
			_this.relocate();
		});
		$event(window, 'load', function() {
			_this.relocate();
		});
		this.relocate();
		$dialog[id] = this;
	};
	Dialog.prototype.relocate = function() {
		var top = (window.innerHeight - this.dialog.scrollHeight) / 2;
		var left = (window.innerWidth - this.dialog.scrollWidth) / 2;
		$css(this.dialog, {
			'left' : (left > 0 ? left : 0) + 'px',
			'top' : (top > 0 ? top : 0) + 'px'
		});
	};
	Dialog.prototype.close = function() {
		$css(this.element, 'display', 'none');
		delete $dialog[this.id];
	};
	this.CustNum = function(num) {
		var str = num.toString(), len = str.length, elements = this.elements = [];
		for(var i = 0; i < len; i++) {
			elements.push("<div class=\"num-" + str.charAt(i) + "\">" + str.charAt(i) + "</div>");
		}
		return elements.join('');
	};

})();

