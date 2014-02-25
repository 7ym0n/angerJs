var angerJsTable = {
	version : 'v0.1',
	_default : {
		container:{},//一个document对象或者一个字符串
		/**
		fields的参数格式:
		{
			date:{
				thText:"日期",
				colAlign:"right",
				needOrder:false,	
				precision:0
				},
			....
		}
		*/
		fields : {},//thead 的属性
		data : {},//表格数据 数据格式必须是一个数组对象[{date:"2014-02-24", ...}, ...]
		prefix : 'data_',
		order : {
			orderField:"",
			orderBy:""
		},
		pages:{
			isPage : false,//分页
			size : 10,
			data : {},
			index: 0,
			offset:5,
			nextClass : "next",
			currentClass : "current",
			prevClass : "prev",
			dotClass : "dot",
			totalClass: 'pageTotal',
			prevText:"上一页",
			nextText:"下一页"
		},
		/*
		* 设置表格css样式
		*/
		setCss : {
			div:{
				containerClass : 'table_wrapper',
				containerId : 'table_wrapper',
				containerStyle : '',
			},
			table:{
				containerClass : 'data_table',
				containerId : 'data_table',
				containerStyle : '',
			},
			th:{
				"Date":{
					thClass : 'table_th',
					thId : 'table_th',
					thStyle : '',
				},"SessionNum":{
					thClass : 'table_th',
					thId : 'table_th',
					thStyle : 'color:#989898;',
				}
			},
			td:{
				"SessionNum":{
					tdClass : 'table_td',
					tdId : 'table_td',
					tdStyle : 'color:red',
				}
			},
			
			//todo color.
			tr:{
				"SessionNum":{
					trClass : 'table_td',
					trId : 'table_td',
					trStyle : 'color:red;',
				}
			}
			
		}
	},
	extend : function(destination, source) {
		if((typeof destination == 'object' || typeof destination == 'array') && 
			(typeof source == 'object' || typeof source == 'array')){
			for (var property in source) {
				destination[property] = source[property];
			}
		}
		return destination;
	},
	initData : function(opt){

		if(typeof(opt.container) == 'array'){
			opt = opt.container[0];
		}else if(typeof(opt.container) == 'string'){
			this._default.container = document.getElementById(opt.container)
		}else if(typeof(opt.container) == 'object'){
			this._default.container = opt.container
		}else{
			this._default.isDivNode = false;
		}
		//如果没有得到document对象，自动创建一个
		this._default.isDivNode = (this._default.container.nodeName == 'DIV');
		if(!this._default.isDivNode){	
			this._default.container = document.createElement("div");
			this._default.isDivNode = (this._default.container.nodeName == 'DIV');
			document.getElementsByTagName("body")[0].appendChild(this._default.container);
		}
		
		this._default.data = opt.data||{};
		this._default.fields = this.extend(this._default.fields,opt.fields);
		this._default.pages = this.extend(this._default.pages,opt.pages);
		this._default.prefix = opt.prefix||this._default.prefix;
		this._default.setCss = opt.setCss||this._default.setCss;
		this._default.order = opt.oder||this._default.order;
	
	},
	/**
	 * 判读是否为整型
	 * @param {number} num 需要格式化的数字.
	 * @param {string} percision 精度.
	 * @param {string} token 分隔符.
	 * @return {number} 格式化后的结果.
	 */
	numberFormat:function (num, percision, token) {
		var num =num_str = num.toString();
		var _token = token || ',';
		var _percision = percision || 0;
		if (/^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(num_str)) {
			var num_str_tmp = parseFloat(num_str).toFixed(_percision);
			num_str_tmp = num_str_tmp + '';
			var numArr = num_str_tmp.split('.');
			var n = parseInt(numArr[0].length / 3);
			var re = '';
			var reg = '';
			for (var i = 0; i < n; i++) {
				re = re + ',$' + (i + 1);
				reg = reg + '(\\d{3})';
			}
			reg = new RegExp(reg + '$');

			numArr[0] = numArr[0].replace(reg, re).replace(/^,/, '');
			if (num_str != num) {
				return num.replace(">" + num_str + "<", ">" + numArr.join('.') + "<");
			}
			return num.replace(num_str, numArr.join('.'));
		} else {
			return num;
		}
	},
	/**
	 * 字符串的格式化
	 * @param {string} str 需要格式化的字符串.
	 * @param {string} reg 需要替换的字符.
	 * @param {string} target 替换成该字符.
	 * @return  格式化后的结果.
	 */
	strFormat:function (str, reg,taget) {
		if(typeof taget == undefined){
			taget = '';
		}
		return str.replace(reg, taget);

	},
	/**
	 * 判读是否为整型
	 * @param {date} date 需要格式化的日期.
	 * @param {string} formater 格式化的参数.
	 * @return {string} 格式化后的结果.
	 */
	dateFormat:function (date, formater) {
		var _formaer = formater || 'h:m:s';
		var reg = /^(\d{2,4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/g;
		reg.lastIndex = 0;
		var result = reg.exec(date);
		if (result) {
			return formater.replace('y', result[1]).replace('M', result[2]).replace('d', result[3]).replace('h', result[4]).replace('m', result[5]).replace('s', result[6]);
		} else {
			return date;
		}
	},
	createTable : function(opt){
		this.initData(opt);
		var options = this._default;
		if(typeof(this._default.container) != 'object') return;
		var container = this._default.container;
			
		if(this._default.isDivNode){
			container.innerHTML='';
			if(this._default.setCss.div.containerClass!="" 
			&& this._default.setCss.div.containerClass!="undefined"){
				container.className = this._default.setCss.div.containerClass;
			}else{
				container.className = "table_wrapper";
			}
			
			var _table = document.createElement("TABLE");
			if(this._default.setCss.table.containerClass!="" 
			&& this._default.setCss.table.containerClass!="undefined"){
				_table.className = this._default.setCss.table.containerClass;
			}else{
				_table.className = 'data_table';
			}
			
			var _colgroup = document.createElement('COLGROUP');
			var _thead = document.createElement('THEAD');
			
			for(var key in options.fields){
				var _col = document.createElement("COL");
				_col.className += (options.prefix + key);
				_colgroup.appendChild(_col);
				var _th = document.createElement('TH');
				_th.setAttribute('name', key);
				if(options.fields[key].needOrder!=false){
					_th.className += 'hover enable';
				}else{
					_th.className +='visited';
				}
				if(options.fields[key].thText){
					if(typeof(this._default.setCss.th[key])!="undefined"
						&&typeof(this._default.setCss.th[key].thStyle)!="undefined" 
						&& this._default.setCss.th[key].thStyle!=""){
						_th.style.cssText=this._default.setCss.th[key].thStyle;
					}
					if(typeof(this._default.setCss.th[key])!="undefined" &&
						this._default.setCss.th[key].thId!=""){
						_th.setAttribute('id', this._default.setCss.th[key].thId);
					}
					_th.innerHTML += (options.fields[key].thText)+'<i class="icon-orderby"></i>';
					_thead.appendChild(_th);
				}
			}
			_table.appendChild(_colgroup);
			_table.appendChild(_thead);
		
			//判断是否分页
			if(options.pages.isPage){
				this.createPage(options);
			}else{
				//直接赋值给data
                options.pages = {};
                options.pages.data = options.data;
			}
			if(options.pages.data.length<=0){
				container.innerHTML += "<h4>没有数据</h4>";
			}
			//container.appendChild(_table);
			var _tbody = document.createElement('TBODY');
			for (var i = 0; i < options.pages.data.length; i++) {
				var _tr = document.createElement('TR');
				var row = options.pages.data[i];
				//console.log(row);
				for(var key in options.fields){
						
					var _td = document.createElement('TD');
					if(typeof(options.setCss.td[key])!="undefined"
						&&typeof(options.setCss.td[key].tdStyle)!="undefined" 
						&& options.setCss.td[key].tdStyle!=""){
						_td.style.cssText=options.setCss.td[key].tdStyle;
					}
					_field = options.fields[key];
					var col = row[key];
					//过滤null和undefined等特殊字符
                    if (col == null || col == undefined || col == 'null' || col == 'undefined') {
                        col = '';
                    }
					if (typeof(_field.format) == 'function') {
                        col = _field.format(options,col);//格式化显示，把整个对象和列的值传进去。定义该回调时注意接收两个参数
                    }
					//如果是数字类型，通过precision和token进行格式化 , 并且右对齐
                    if (_field.number) {
                        col = this.numberFormat(col, _field.precision, _field.token);
                    }
					//如果是时间类型，根据指定的格式进行格式化
                    if (_field.date) {
                        col = this.dateFormat(col, _field.formater);
                    }
					//通过div方式控制列的文本位置
                    if (_field.colAlign) {
                        col = "<div style='width: 100%; height: 100%;text-align:" + _field.colAlign + ";'>" + col + "</div>";
                    }
					_td.innerHTML=col;
					_tr.appendChild(_td);
				}
				
				_tbody.appendChild(_tr);
			}
			
			_table.appendChild(_tbody);
			container.appendChild(_table);

		}
		
	},
	addEvent:function (obj, eventName, func) {
		eventName = eventName.replace('on', '');
		if (document.addEventListener) {
			obj.addEventListener(eventName, func, false);
		} else if (document.attachEvent) {
			obj.attachEvent('on' + eventName, func);
		} else {
			obj['on' + eventName] = func;
		}
	},
	createPage:function(options){
		if(typeof options.data != 'object'&&typeof options.data != 'array'){
			options.data = [];
		}
		options.pages.rowCount = options.data.length;
		
		if(options.pages.size < options.pages.rowCount){
			options.pages.count = Math.ceil(options.pages.rowCount/options.pages.size);
		}else{
			options.pages.count = 1;
		}

		if(options.pages.index < options.pages.count){
			var p = document.getElementById("pagination");
			if(p != null){
				options.container.removeChild(p);
			}
			options.pages.container = document.createElement('DIV');
			options.pages.container.setAttribute('id', 'pagination');
			var _this = this;
			var page_right_div = document.createElement('div');
			page_right_div.className = 'div_page';
			options.pages.container.appendChild(page_right_div);
			 //如果page的页数大于page的偏移
			if (options.pages.count > options.pages.offset) {
				if(options.pages.index > 0){
					//创建“上一页”
					var a = document.createElement('div');
					a.className = options.pages.prevClass;
					a.innerHTML = options.pages.prevText;
					//“上一页”的点击事件
					this.addEvent(a, 'click', function () {
						//索引减一
						options.pages.index = options.pages.index - 1;
						if (options.pages.index < 0) {
							return;
						}
						_this.createTable(options);
						
					});
					//把“上一页”加入到container中
					page_right_div.appendChild(a);
				}
			}
			//返回最接近 "偏移量/2" 的整数
            var middle = Math.floor(options.pages.offset / 2);
			//起始位置为page的索引减去middle
			var start = options.pages.index - middle;

			//start赋值，如果小于0，返回0; 如果start和偏移量的和 大于page的页数，则返回page的页数-偏移量 ， 否则返回start
		
			start = start < 0 ? 0 : (start + options.pages.offset) > options.pages.count ?
			(options.pages.count - options.pages.offset) : start;
			//长度为start+页面的偏移量
			var len = start + options.pages.offset;
			//如果长度比页数大，则长度赋值为page的页数
			if (len > options.pages.count)
				len = options.pages.count;
			//从start到len之间遍历
			
			for (var i = start; i < len; i++) {
				if(i >= 0){
					//创建"当前页"
					var a = null;
					if (i == options.pages.index) {
						a = document.createElement('STRONG');
						a.className = options.pages.currentClass;
					}
					else {
						a = document.createElement('span');
					}
					a.innerHTML = 1 + i;
					//绑定"当前页"的点击事件
					(function (i) {
						var index = i;
						_this.addEvent(a, 'click', function () {
							options.pages.index = index;
							_this.createTable(_this._default);
						});
					})(i);
					a.style.cssText = "cursor: pointer";
					(a.nodeName == 'STRONG')?a.style.cssText+="color:red;":null;
					page_right_div.appendChild(a);
				}
			
			}
			

			//如果page的页数比len大
			if (options.pages.count > len) {

				//如果page的页数比(len+1)大
				if (options.pages.count > len + 1) {

					//创建"..."
					var strong = document.createElement('span');
					strong.className = options.pages.dotClass;
					strong.innerHTML = '...';
					page_right_div.appendChild(strong);
				}

				//创建"最后页"
				var a = document.createElement('A');
				a.innerHTML = options.pages.count;
				this.addEvent(a, 'click', function () {
					options.pages.index = options.pages.count - 1;
				 
					_this.createTable(options);
					
				});
				page_right_div.appendChild(a);
			}

			//如果page的页数大于page的偏移量
			if (options.pages.count > options.pages.offset) {
				if(options.pages.index < (options.pages.count-1)){
					//创建“下一页”
					var a = document.createElement('div');
					a.className = options.pages.nextClass;
					a.innerHTML = options.pages.nextText;
					this.addEvent(a, 'click', function () {
						var tempIndex = options.pages.index + 1;
						if (tempIndex == options.pages.count) {
							return;
						}

						options.pages.index = options.pages.index + 1;
						if (options.pages.index > (options.pages.count - 1)) {
							return;
						}
						
						_this.createTable(options);
						
					});
					page_right_div.appendChild(a);
				}
			}
			//创建总行数
			var spanTotal = document.createElement("div");
			spanTotal.className = options.pages.totalClass;
			spanTotal.innerHTML = ("<span>共<em>" + options.pages.rowCount + "</em>条记录</span>");

			page_right_div.appendChild(spanTotal);

			//如果表格的所有内容的行数小于分页数，则不显示分页信息

			if (parseInt(options.pages.rowCount) <= parseInt(options.pages.size)) {
				options.pages.container.style.display = 'none';
			}
			
		}
		
		typeof options.pages.container == 'object' && 
		options.container.appendChild(options.pages.container);	
		return options.pages.data = options.data.slice(options.pages.index * options.pages.size, 
							(options.pages.index + 1) * options.pages.size);
	},
};
