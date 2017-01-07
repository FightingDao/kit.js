/*!
 * @description: 较为常用的工具集合
 * @author: kelichao
 * @update: 2016-11-19
 * @update: 2016-12-28 / 增加了埋点文件以及调用客户端接口文件的方法
 * @update: 2017-01-04 / 增加了MVC架构
 * @https://github.com/Kelichao/kit.js
 */

// 防止undefined被改写
;(function(undefined) {

	// root 的值, 客户端为window, 服务端(node) 中为 exports
	var root = this;


	var host = document.location.host,
		// 判断对象类型
		kind = Object.prototype.toString;

	// 方法简写
	// 缓存变量, 便于压缩代码
  	// 此处「压缩」指的是压缩到 min.js 版本
  	// 而不是 gzip 压缩
  	// 同时可减少在原型链中的查找次数(提高代码效率
	var ArrayProto = Array.prototype, 
		ObjProto = Object.prototype, 
		FuncProto = Function.prototype;

	var push = ArrayProto.push,
		pop = ArrayProto.pop,
		href = root.location.href,
    	slice = ArrayProto.slice;

	// 安全构造函数法
	var kit = function(obj) {

		// 如果传入了参数，且参数是A的实例对象，直接返回该参数对象
		// 否则就把obj当参数使用了
		if (obj instanceof kit) {
		    return obj;
		}

		// 如果忘记了实例化，this的prototype就没有保存着A的prototype地址
		if(!(this instanceof kit)) {
			return new kit(obj);
		}

		// 如果obj并不是kit的实例
		// 且这里已经处于正常实例化阶段
		// 用于OOP方式调用，将传入的对象赋值给内部对象
		// wrapped仅仅用来保存对象
		this._wrapped = obj;

		/*
		 * 在new状态下，return返回的都是当前的this ->
		 * 且this指向的地方都是新开辟的堆空间地址
		 * 默认就是这种模式，可以不写
		 */
		// return this;
	};

	//原型对象挂载简写
	fn = kit.fn = kit.prototype;

	// 兼容node模块
	// node中有exports/module.exports模块用于导出某个js文件
	// node中可以用CMD模式调用此文件：var MATH = require("./MATH") 
	// 直接检验exports 是兼顾老版本nodeAPI
	if (typeof exports !== 'undefined') {

		// 在正常node环境中
		// module以及module.exports都存在
	  	if (typeof module !== 'undefined' && module.exports) {

	  	// exports 原本挂载的是module.exports对象地址，
	  	// 如果重写module.exports为kit对象则需要顺带
	  	// 将exports地址指向kit，重写后他们两者会丢失联系
	    exports = module.exports = kit;
	  	}

	// 这句话不是特别重要
	exports.kit = kit;

	} else {
		// 把整体绑定在全局变量
		// 其实就是global.kit
	    root.kit = kit;
	}

	// defined这个方法是用于判断变量是否被定义
	// 如果还没有定义 Uncaught ReferenceError: * is not defined(…) -> 0
	// 未定义的变量，建议直接typeof
	kit.isUndefined = function(variable) {
		if (typeof variable === "undefined") {
			return true;
		}
		return false;
	};

	// 类型映射,目前是11种
	var typeMap = {
		"isObject":		"[object Object]",
		"isArray":      "[object Array]",
		"isBoolean":    "[object Boolean]",
		"isFunction":   "[object Function]",
		"isString":     "[object String]",
		"isMath":       "[object Math]",
		"isDate":       "[object Date]",
		"isNull":       "[object Null]",
		"isRegExp":     "[object RegExp]",
		"isNumber":     "[object Number]",
		"isError":      "[object Error]"
	};

	// 内部生成对象判断函数
	var _creatrTypeFunction = function(object) {
		
		// 这里没有加var导致在ie中报错
		for(var item in object) {

			// 将方法挂载到对象上,每个item一个闭包空间来去除闭包影响
			// underscore用forEach生产，原理跟这个一样,后期可以调整
			kit[item] = (function(val) {
				return function(total) {
					return kind.call(total) === object[val];
				};
			})(item);
		}
	};

	_creatrTypeFunction(typeMap);

	// forEach负责用来遍历对象/数组属性
	kit.each = kit.forEach = function(total, fn, context) {

		if (kit.isObject(total) || kit.isFunction(total)) {
			for(var i in total) {
				fn(total[i], i);
			}
		} else if (kit.isArray(total)) {
			var i = 0;
			for (; i < total.length; i++) {
				fn(total[i], i);
			}
		}
	};

	// 判断对象或者数组是否为空
	kit.isEmpty = function(total) {
		var flag = true;
		if (kit.isObject(total)) {
			kit.some(total, function() {
				flag = false;
				return false;
			})
		} else if (kit.isArray(total)) {
			if (total.length > 0) {
				flag = false;
			}
		} else {
			flag = false;
		}

		return flag;
	};

	// some如果有一项返回false则返回false
	kit.some = function(total, fn) {
		var flag = "";
		if (kit.isObject(total)) {
			for (var i in total) {
				flag = fn(total[i], i);
				if (flag === false) {
					return false;
				}
			}
		} else if (kit.isArray(total)) {
			for (var i=0; i < total.length; i++) {
				flag = fn(total[i], i);
				if (flag === false) {
					return false;
				}
			}
		}

		// 没有返回false的项目
		return true;
	}

	// 拆分一个字符串中间有间隔的字符串
	// 如："aaa    bbb cc    ddd"
	kit.splitSpace = function(str) {
		return str.split(/\s+/g);
	};

	// 去除字符串两边的空格
	// 如果有第二个参数，则把所有空格删除
	// kit.trim("  dsfdsa=- 234.;df  ");
	kit.trim = function(str,state) {
		var totalStr = "";

		if (state === true) {
			totalStr = str.replace(/\s/g, "");
			return totalStr;

		}
		
		if (kit.isString(str) === true) {
			// 成功kit.trim("  fsdf f     ");
			totalStr = str.replace(/((^\s*)|(\s*$))/g, "");
		} else {
			throw Error("需要解析的并不是字符串");
		}

		// 失败：如果末尾有两个以上的空格就读取失败了
		// str.replace(/^\s+((\S|\s)*)\s+$/g, "$1");
		// jq写法   str.replace(/^\s+|((?:^|[^\\\\])(?:\\\\.)*)\s+$/g, "$1");
		return totalStr;
	};

	// 拆分规律字符串函数
	// key键值， string输入的串，type分割类型，flag是否除去首个问号字符
	var _strToObject = function(key, string, type ,flag) {
	    var str = string,
	        arr = [],
	        obj = {},
	        first = null,
	        final = null,
	        cont = "";

	    if (typeof str == 'string' && str.length != 0) {

	    	// 注意，window.location.search 截取的串都是带问号的
			// 如果有问号则去除问号
			if (flag) {
				str = str.search(/^\?/g) !== -1 ? str.substring(1) : str;
			}

	        arr = str.split(type);
	        kit.forEach(arr,function(value, key) {
	        	cont = value.split("=");
	            first = kit.trim(cont[0]);
				final = kit.trim(cont[1]);
	            obj[first] = final;
	        });
	    }

	    if (!!key) {
	    	obj = obj[key];
	    }

	    return obj;
	};

	
	// address为需要解析成对象的地址串
	// key为需要取得的键值
	kit.locaSearch = function(key, address){

		address = address || root.location.search;
		var total = _strToObject(key, address, "&", true);
	    
	    // 测试用例kit.locaSearch("fsd","?sfsd=3423&we=234&fsd=324");
	    return total;
	};

	// cookie对象获取函数
	// aaa=123;bbb=456;ccc=678
	kit.cookie = function(key,string) {

		var cookie = string || root.document.cookie,
			total = "";
		
		// 如果传入的字符串结尾带了分号(;)，则进行删除    
		if (cookie.slice(-1) === ";") {
			cookie = cookie.slice(0, -1);
		}

		total = _strToObject(key, cookie, ";", false);
		// 测试用例kit.cookie("bbb","aaa=123;bbb=789");
		return total;
	};

	/*
		// 对象要求：属性中有对象，且该内部对象有简单类型。
		var person = {
			name: "Bob",
			sing:{
				"name":"发如雪"
			}
		};

		var x =kit.mixin(person);
		person.sing.name = "";
		console.log(x);
	*/
	// 糅合方法,注意这个方法不能在实例上使用
	// kit.mixin(true, {a:1}, {b:2}, {c:3}, {d:4});
	// kit.mixin( [deep ], target, object1 [, objectN ] )...
	/*
	    // 深度复制测试
		var x = {
			e:{
				f:100
			}
		};
		var b = {a:1};
		kit.mixin(true,b, {d:22}, {c:33}, x);
		x.e.f = 1111;
		console.log(b.e.f) // 打出100说明复制正确
	*/

	// 用递归方法拷贝深层次对象,得到全新对象
	var _recursive = function(cont, res) {

		//这里增加了数组处理，暂时还不清楚函数体如何进行复制。
		var arg = arguments.callee,
			object = (cont instanceof Array) ? [] : {};

		// 继承原先的对象键值对
		kit.forEach(res, function(value, key) {
			object[key] = res[key];
		});

		// 遍历中间值的键值对
		kit.forEach(cont, function(value, key) {
			// 如果键值对的属性是一个引用对象
			if (kit.isObject(cont[key]) || kit.isArray(cont[key])) {
				object[key] = arg(cont[key], res[key]);

			// 如果是一个简单对象，则直接赋值
			} else {
				object[key] = cont[key];
			}
		});
		return object;
	};

	// 糅合属性方法
	kit.mixin = function() {

		var total,
			flag,
			result,
			i = 0,
			temporary = {},
			length = arguments.length;


		// 如果第一个是状态码，把total换到arg[1];
		if (typeof arguments[i] === "boolean") {
		 	flag = arguments[i];
		 	i++;
		}

		// 这里增加了数组处理，暂时还不清楚函数体如何进行复制。
		// total = arguments[i];
		result = arguments[i];

		// i 当前参数下标
		// length参数长度
		for (; i < length; i++) {

			// 当前被拷贝的对象
			total = arguments[i];

			// 深度克隆
			if (flag == true) {

				temporary = _recursive(total, result);

				// 得到temporary后进行浅复制
				kit.forEach(temporary, function(value, key) {
					result[key] = value;
				});

			// 浅复制
			} else {

				kit.forEach(total, function(value, key) {
					result[key] = value;
				});
			}
		}
		return result;
	};

	var query = function(id) {
		return document.querySelector(id);
	};

	var selects = function(class1) {
		return document.querySelectorAll(class1);
	};

	// 客户端用户id
	var CLIENT_USERID;
	kit.CLIENT_USERID = CLIENT_USERID = kit.cookie("userid");

	// 客户端版本号
	kit.CLIENT_VERSION = kit.cookie("version") ? kit.cookie("version").split(".").slice(-1)[0] : "";


	// i客户端埋点快捷方法
	// 调用此方法之前需要引入TA.js
	// 此类对象方式需要点击，保险起见是mousedown
	/*
		{
			"ibyf130_3242": ".class1",
			"iby2345_fre4": ".class2"
		}
	*/
	// 数组方式["ibyf130_3242","iby2345_fre4"]
	// 网页加载后直接触发
	kit.ta = function(param, type) {

		var type = type || "mousedown";
		// 内部实现ta的方法
		function _ta(param) {
			if (kit.isObject(param)) {
				if (typeof $ === "function") {
					kit.forEach(param, function(value, key) {

						// 优化了dom对象是空数组或者是""的时候事件委托会在document触发
						if (value !== "" && value !== []) {
							$(document).on(type, value, function() {
								// 触发埋点方式
								TA.log({"id": key,"ld": "client","client_userid": CLIENT_USERID,"send_time": ""});
							});
						}

					});
				}
			} else if (kit.isArray(param)) {
				kit.forEach(param, function(value, key) {
					// 触发埋点方式
					TA.log({"id": value,"ld": "client","client_userid": CLIENT_USERID,"send_time": ""});
				});
			}
		}

		// 如果没有该脚本
		if (typeof TA === "undefined") {
			console.warn("未引入TA.js,正在动态加载标签");
			// 这个地址是固定的
			kit.addScript("/thsft/js/ta.min.js",function() {
				_ta(param);
			});
			return;
		}

		_ta(param);
	};

	// 动态创建dom元素
	kit.addScript = function(url, callback) {
		// 创建dom元素
		var script = document.createElement("script");

		// 设置属性
		script.type = "text/javascript";
		script.src = url;

		// 此处参考seaJS中加载代码时所用的
		// ie8中这个就是false ，chrome中为true
		var supportOnload = "onload" in script;

		if (supportOnload) {
			script.onload = function() {

				// success code
				callback();
			};
		} else {
			script.onreadystatechange = function() {

				// IE8中这两个属性值会有两个阶段  1.loading   2.loaded 某些情况下是complete
				if(script.readyState === "loaded"|| script.readyState === 'complete') {

					// success code
					callback();
				}
			}
		}

		document.body.appendChild(script);
	};

	// 指定bind对象，原生bind
	kit.bind = function (context, fn) {

		var final = null;
		// 闭包保留内存context与fn
		if (kit.isFunction(fn)) {
			final = function() {
				fn.apply(context, arguments);
			};
		} else {
			// 如果不是回调函数，直接返回fn
			final = fn;
		}

		return final;
	};

	// 数据模型，比如总参数，总配置，分段参数等
    // 如new一个
    // opts = new kit.Model({a:1,b:2});
	kit.Model = function(total) {
		if (this instanceof kit.Model) {
			var _this = this;

			this._options = total;
			// this._changeFunction = changeFunction;

		} else {
			return new kit.Model(total);
		}
	};

	// 模型的原型链方法
	kit.Model.prototype = {
		constructor: kit.Model,
		//有些情况下直接取值
		// 最原始的取值法
		self: function() {
			return this._options;
		},
		// 只有数据模型才具有的set,get方法
		get: function(key) {
			return this._options[key];
		},
		// 设置模型的值
		set: function(value) {

			var temporary = this._isChanged(this._options, value),
				final = kit.mixin(true, this._options, value);

			if (temporary === false) {
				this.change(final);
			}
			return final;
		},
		// 触发变动
		change: function(final) {
			console.log("mode发生了变动");
			// console.log(final);
		},
		// 判断参数(obj/arr)覆盖原值后原值是否改变
		_isChanged: function (total, add) {
			return kit(add).some(function(value, key) {
				return value == total[key];
			});
		}
	};

	// 控制器
	// 将this强制绑定到控制器本身，用于this调用
	// 暂时只用于单纯的放下业务逻辑
	kit.Controller = function(fn) {
		if (this instanceof kit.Controller) {

			// 控制器遍历将this指向变更
			var controlEach = kit.bind(this, function(value, key) {

				// 将绑定到dom的this指向改变
				this[key] = kit.bind(this, value);

				// 不改变dom的this指向
				// this[key] = value;
			});

			kit.forEach(fn, controlEach);
			// this.fn = fn;
		} else {
			return new kit.Controller(fn);
		}
	};

	kit.Controller.prototype = {
		constructor: kit.Controller,
		// 回调队列
		callback: function(parameter) {
			var argue = parameter.argue;
			var callback = parameter.callback;
			var _this = this;
			var callbackArray = [];

			kit.forEach(callback, function(value, key) {

				if (kit.isFunction(_this[value])) {
					callbackArray.push(_this[value]);
				} else {
					console.info("有回调列队项不是函数");
				}
			});

			this.deliver(callbackArray, argue);
		},
		// 触发列队
		deliver: function(arr, argue) {
			kit.forEach(arr, function(fn) {
				fn.apply(1,argue);
			});
		}
	};

	// 通过视图绑定页面事件,是Model与Controller的载体
	// kit.View({
	// 	current: document,
	//  control: control,
	// 	events:{
	// 		"div": "click fn1", // 当心"aa bb "这种情况trim去除
	// 		".bbb": "change fn2",
	//		"#ccc": "fn3"
	// 	}
	// });
	kit.View = function(total) {

		if (this instanceof kit.View) {

			// 事件代理总对象
			this._current = total.current || document;

			// 控制器函数指向，control用于内部调用
			// this._Controller = this.control = total.control;

			// 事件绑定函数
			this._eventsFunction = total.eventsFunction;

			// 触发事件绑定
			this.bindEvent(total.events);

			// 触发初始化事件
			total.initialize();
		} else {
			return new kit.View(total);
		}
	};

	// 视图原型方法
	kit.View.prototype = {
		constructor: kit.View,
		bindEvent: function(events) {
			// var _this = this;
			var callback = function(value, key) {

				// 去除两边空格，并拆分
				var eventType = "",
					fn = null,
					arr = kit.splitSpace(kit.trim(value));

				if (arr.length === 1) {
					eventType = "click";
					fn = arr[0];
				} else if (arr.length >= 2) {
					eventType = arr[0];
					fn = arr[1];
				}

				// 处理事件函数不存在的情况，jq给的提示不明显
				if (this._eventsFunction[fn] === undefined) {
					throw Error(fn + "函数不存在");
				}

				$(this._current).on(eventType, key, this._eventsFunction[fn]);
			};

			callback = kit.bind(this, callback);
			kit.each(events, callback);
		}
	};

	// 出现错误的时候执行的全局操作
	kit.error = function(fn) {
		window.onerror = function() {
			fn();
		}
	};

	// 渲染图表 echarts2
	kit.chartRender = function(option, total) {
		var proChart = null;

		if(total instanceof jQuery || total instanceof Zepto) {
			total = total.get(0);
		}

		// 这里需要原生dom节点
		proChart = echarts.init(total);

		//传入参数
		proChart.setOption(option, true);
	};

	// 判断一个对象是否是空对象
	kit.emptyObj = function(object) {
		
	};

	// setTimeout(fn,0)// 可以排到队列的最后面，可以防止与route的改变冲突

	// 写一个新闻滚动栏组件

	// 是否满足请求返回格式的状态函数记得补0

	// 是否有disabled状态的函数无法点击

	// 加减日期函数
	// 没传分割符号默认是“-”
	kit.timeHandle = function(inputTime, value, symbol) {
		var year = "",
			month = "",
			day = "",
			totalTime = null;

		symbol = symbol || "-";
		// 格式化输入日期
		inputTime = new Date(inputTime);
		
		// 得到目标日期
		totalTime = (inputTime).setDate(inputTime.getDate() + value);
		totalTime = new Date(totalTime);

		// 为月与日补0，凑成两位
		year = totalTime.getFullYear();// getYear已经不推荐使用了
		month = totalTime.getMonth() + 1// getMonth是从0月开始计数的
		day = totalTime.getDate();

		// 给日月补0
		if (month < 10) {
			month = "0" + month; 
		}
		if (day < 10) {
			day = "0" + day;
		}

		// 拼接日期，我这边只做了年月日处理
		totalTime = year + symbol +
					month + symbol + 
					day;

		return totalTime;
	};

	// 客户端跳转OnClientCmd接口，动态引入api.js
	// 在65上加载貌似是55ms还是比较快的
	kit.clientCmd = function(toClient) {
		if (root.API === undefined) {
			kit.addScript("/thsft/js/api/api.js",function() {
				root.API.OnClientCmd(toClient);
			});
			return;
		} else {
			root.API.OnClientCmd(toClient);
		}
	};


	// 启用underscore 启用Mustache.js类型模板
	kit.underToMustache = function() {

		// 设置Mustache.js类型的模板语法
		// 这句话需要写在_.template()方法之前
		_.templateSettings = {
		  interpolate: /\{\{=([\s\S]+?)\}\}/g,
		  evaluate: /\{\{([\s\S]+?)\}\}/g,
		  escape: /\{\{-([\s\S]+?)\}\}/g
		};
	};

	// 通过undescore模板渲染页面
	// kit.tempRender("<a>234234234<%=a%></a>", document.body,{a:"aaa"})
	kit.tempRender = function(template, total, data) {

		var template = _.template(template);

		var compiled = template(data);
		if (total instanceof jQuery || total instanceof Zepto) {
			total.html(compiled);
		} else {
			total.innerHTML = compiled;
		}
	};

	// 冒泡排序法对数组进行排序
	// 第一个参数如果是"asc"则是正序从小到大(默认)
	// 如果是"desc",则倒叙，从大到小
	//arr = [85, 24, 63, 45, 17, 31, 96, 50];
	kit.sort = function() {

		// 冒泡排序法排序
		var temp,
			flag = false,// 是否交换过
			state = false,// 是否需要倒序
			argue = arguments[0],
			arr,
			length;// 7
			// 因为排序次数只要比数组长度少一次
			// 外层循环只要排长度 - 1即可，

		if (typeof argue === "string") {

			// switch用的是严格等
			switch (argue) {
				case "asc":
					state = false;
					break;
				case "desc":
					state = true;
					break;
				default:
					throw "请传入正确的排序方式'asc'或'desc'";
			}

			arr = arguments[1];
		} else {
			arr = argue;
		}

		length = arr.length - 1;

		// 每一次排序都会在数组的顶部出现一个符合要求的数组成员
		for (var i = 0; i < length ; i++) {
			
			// 内层循环
			// 最上面的元素可以通过i除去排序
			// 也就是说已经排好的不需要再排了
			for(var j = 0; j < length - i; j++) {
				if (arr[j] > arr[j + 1]) {
					temp = arr[j + 1];
					arr[j + 1] = arr[j];
					arr[j] = temp;

					// 如果该论循环已经发生了交换
					flag = true;
				}
			}

			// 如果当前排序已经没有变化，则直接退出循环
			if(flag === false) {
				break;
			}
		}

		if(state === true) {
			arr = arr.reverse();
		}

		return arr;
	};

	// 内部对挂载的方法按名称进行排序
	kit.method = function(fn) {

		var names = [];
		kit.forEach(fn, function(fn, name) {
			if(kit.isFunction(fn)) {
				names.push(name);
			}
		});

		return names.sort();
	};

	// 全局路由值存放
	var _route;
	
	// 监听路由变化
	kit.route = function(callback, array) {

		var flag = kit.isFunction(callback);
		var flagArr = kit.isArray(array);

		// 如果参数是函数，则进行绑定
		if (flag) {
			root.onhashchange = function() {

				// hash值其实有没有#都一样，没有的话自动会补
				var hash = root.location.hash.substring(1);

				// 如果有第二个参数且为数组
				if (array !== undefined && flagArr) {
					if (array.indexOf(hash) !== -1) {

						_route = hash;

						// 防止一样的hash触发事件
						if (_route = hash) {
							return;
						}

						callback(hash);
					}
				} else {
					callback(hash);
				}
			}
		}
	};

	// 调用客户端下载框 kit.clientDown("abc", "/thsft/Istrategy/abc.pdf", ".xls");
	// type可选，如果url能够取到地址串，则不会被type覆盖，
	// 如果地址串后面的url没有解析出类型，则会被type覆盖
	kit.clientDown = function(name, url, type) {

		// replace不适合截取
		var typeArray = url.match(/\.(\w{2,4})?$/g);
		var type = typeArray ? typeArray[0] : null || type;

		// 注意这里一定要有type,不然导致整个页面链接改变
		var href = "ifind://!command=down&valuectrl=1&filename=" + name + type + 
				   "&url=http://" + host + url;

		root.location.href = href;
	};

	// 执行一次的函数包装器
	kit.once = function(fn) {
		var totalFn = fn;
		if (kit.isFunction(totalFn) === false) {
			throw "请传入函数方法";
		}
		return function() {
			totalFn();
			totalFn = new Function();
		}
	};

	// 为了能使用OOP形式的调用，将kit的所有方法挂载到原型
	// 去除不是function类型的。
	// 用于添加自定义方法，此方法放到最后执行
	/*
		// 用法
		kit.extend({
			"kelichao":function() {
				console.log("name");
			}
		})
	*/
	// kit.extend( [deep ], target, object1 [, objectN ] )...
	kit.extend = kit.fn.extend = function() {

		var length = arguments.length,
			i = 1,
			target = arguments[0] || {},
			// 参考了underscore
			// 得到排序后的所有方法名数组
			sortFuncName = kit.method(target);

		// 如果第一个参数是布尔状态,就把对象切到第二个参数
		if (typeof target === "Boolean") {
			target = arguments[1] || {};
			i++;
		}

		// 如果目标对象不是对象或者函数，则返回空对象
		if (!(kit.isObject(target) === true || kit.isFunction(target) === true)) {
			target = {};
		}

		if (length === 1) {
			kit.forEach(sortFuncName, function(value, key) {

				// 1.挂载到对象名下
				// 2.挂载到原型链上
				// 3.先保存下当前函数地址(后面用于wrapped)
				var func = kit[value] = target[value];

				// 如果这个方法是之前绑定在原型上的，
				// 那么不做覆盖处理,例如kit.fn.extend
				if (kit.isUndefined(fn[value]) === false) {
					return ;
				}

				// OOP调用,对方法内部传入参数进行修改
				// 否则一般写法为 fn[value] = func;
				fn[value] = function() {

					// 第一个参数
					// 由于这里调用点是kit的实例对象
					// this是当前的kit实例对象
					var args = [this._wrapped];

					// arguments 为 name 方法需要的其他参数
					// 用arguments拿参数的好处是不需要制定形参名
					// 通过apply调用可以一次性传入多个数组
					// 不管有几个参数，我都可以拿到。
					// 执行后args组成一个新数组，包含agruments
					// 把第一个参数改为实例对象
					// 这个push方式相比传统的push，可以一次性传入多个数组值
					push.apply(args, arguments);

					// 将this指向kit ,传入改造后的参数组
					return func.apply(kit, args);
				}
			});
		} else {
			// 暂无处理
		}

	};

	kit.extend(kit);

	// 兼容 AMD 规范
	if (typeof define === 'function' && define.amd) {

		// 要求是define包裹，然后返回整个key对象即可
	    define('kit', [], function() {
	        return kit;
	    });
	}

	// 兼容CMD规范
	// 需要在文件底部注册CMD规范，以underscore为例
	if(typeof define === "function" && define.cmd) {
	  define(function() {
	    return kit;
	  })
	}

}.call(this));

