var angerJsChart = {
	//默认配置
	defaults : {
            title: '',                              //图表标题,备用
            width: '100%',                          //图表宽度
            height: 300,                            //图表高度
            showLabel: true,                        //是否显示标签
            showMarker: true,                       //是否显示点
            chartType: 'area',                      //图表类型
	    /**数据类型，
	     * 1：整数，
	     * 2：浮点数  
	     * 3：百分比，仅在后面追加百分号  
	     * 4：时间格式 HH:MM:SS
	     * 5：百分比，显示时会乘上100 
	     * 6：不处理，保留原有格式 
	     * 7: 当是整数时 format为整数，小数就显示浮点
	     */
	    dataFormat: 6,
	    floatDecimal: 2,						//小数保留位数 
            labelFormat: 0,                         //指定标签显示的格式，0: 不显示，1: 显示Y值， 2：自动计算百分比并显示
            hasData : false,						//是否有数据
	    minY : 0, 								//标识Y坐标最小值
            maxY : 0, 								//标识Y坐标最大
            categories: [],                         //X轴数据
            series:[],                              //Y轴数列
            yMin: null,                             //Y轴最小值
            yMax: null,                             //Y轴最大值
            xAxisLabelStep: 0,                      //X轴标签间隔
            xAxisMaxZoom: 7,						//x轴标签的最大间距
            xAxisTickInterval: 0,                   //X轴刻度间隔
//          useDefaultStyle: true,                  //是否使用默认highchart主题样式
            enableZoom: true,
            autoStep: true,                         //自动计算步长
            showPlotLine: false,                    //是否显示中位线 
            enableLegend: true,                     //是否显示图例
            autoYAxisInterval: true,                //自动计算Y轴间隔
            maxYAxisIntervalCount: 3,               //Y轴最大刻度数 
            theme: '',                              //图表样式主题
            setNoDataCss: 'nodata',                    //无数据时样式名
            setNodateText: '未获取到数据',
            isCompareSeries: false,                 //判断两个数列是否为对比数列
	    autoxAxisDataType: false,				//是否自动识别X轴数据类型，比如日期类型，以别进行相关个性化设置
            chartOptions:{                          //hichCharts的配置
                chart: {},
                title: {},
                xAxis: {
                    categories: '',
                    labels: {staggerLines: 1}
                },
                yAxis: {
                    min: 0
                },
                plotOptions: {
                    pie: {},
                    series: {
                        dataLabels: {}
                    }
                },
                legend:{},
                tooltip:{}
            }
    },
    //图表的默认类型
    defaultChartTypes : {'area': 'area', 'line': 'line', 'pie': 'pie', 'bar': 'bar', 'spline': 'spline', 'column': 'column' },
    _chartOptions:{},
	/**
     * @function toHighChartCategories
     * @description 将配置里面的categories格式化为hightcharts的数据格式
     * @params {categories} 接受一个对象，或者数组对象
     */
    toHighChartCategories : function(categories){
        var hightchartCagetories = [];
        for(var c in categories){
        	hightchartCagetories.push(categories[c]); 
        }

        return hightchartCagetories;
    },

    /**
	 * @function isDate
	 * @description 判断字符串是否有效时间
	 * @params {strDate} 接受一个像2014-02-21的字符串时间
	 */
    isDate : function(strDate){   
		var sDate = strDate.replace(/(^\s+|\s+$)/g,''); //去两边空格;   
		if(sDate==''){
			return false;   
		}

		var s = sDate.replace(/[\d]{4,4}[\-/]{1}[\d]{1,2}[\-/]{1}[\d]{1,2}/g, '');   
		if (s == '')    
		{   
			var t=new Date(sDate.replace(/\-/g,'/'));   
			var ar = sDate.split(/[-/:]/);   
			if(ar[0] == t.getFullYear() && ar[1] == t.getMonth() + 1 && ar[2] == t.getDate())   
			{   
				return true;   
			}   
		}   

		return false;   
    },

    /**
     * @function toHighChartSeriesData
     * @description 将对象，或者对象数组转换成highchart可识别的数组对象
     * @params {series} 接受一个对象，或者对象数组 
     */
    toHighChartSeriesData : function(series){
    	var highchartSeries = [];
        var highchartSerie;
        if ($.isArray(series)){
            for(var i in series){
                var ser = series[i];
                if(typeof(ser) == 'object'){
                	highchartSerie = this.toSeriesItem(ser);
                    highchartSeries.push(highchartSerie);
                }
            }
        }
        else{
        	highchartSerie = this.toSeriesItem(series);
            highchartSeries.push(highchartSerie);
        }

        return highchartSeries;
    },

    /**
     * @function toSeriesItem
     * @description 把数据项转化成highchart可识别的数据对象
     * @params {item} 必须是个对象
     */
    toSeriesItem : function(item){

    	if(!item){
    		return {name:'',data:[]};
    	}

    	var tmpSeries = {
    			name: item.name || '',
    			data:[]
    	};

    	tmpSeries = $.extend(true, tmpSeries, item);
    	//清空合并后的数据
    	tmpSeries.data = [];
    	var tmpSData = item.data || [];
    	var hightchartData = [];
    	var counter = 0;
    	var sumYaxis = 0;
    	for(var i in tmpSData){
    		var current = tmpSData[i] 
    		if(typeof(current) == "object"){
    			//检测是否是饼状图,如果为false，将设置marker
        		!this.isPieChart() && (
        				current.marker = current.marker || {},
        				typeof(current.marker.enabled) == 'undefined'
        				&& (current.marker.enabled = false));
        		current.y != null && (this.defaults.hasData = true, counter++, this.defaults.maxY = this.defaults.maxY > current.y? this.defaults.maxY : current.y, sumYaxis += current.y);
        		hightchartData.push(current);
    		}	
    		
    	}
    	//计算百分比
    	for(var i in hightchartData){
            var point = hightchartData[i];
            if (typeof(point) == "object" && point.y != null){
                !this.isPieChart() && (point.marker.enabled = counter <= 7);
                point.percentage = Math.round(parseFloat(point.y * 10000) / sumYaxis) / 100;
            }
        }
    	
    	tmpSeries.data = hightchartData;
    	tmpSeries.showInLegend = this._chartOptions.legend.enabled;

    	return tmpSeries;
    },

    /**
     * @function isPieChart
     * @description 判断是否是饼状图
     * @params {} 默认判断chartOptions下的类型.
     */
    isPieChart : function(){
    	return this._chartOptions.chart.type === 'pie';
    },

    /**
     * @function setChartTheme
     * @description 设置highcharts主题，如参数theme为空，则加载默认配置，目前仅支持仅支持默认的主题
     * @params {theme} 默认为空.
     */
    setChartTheme : function(theme){
        //highchart默认配置
        var defOptions = {
            title: {
                margin: 20,
                y: 20
            },
//            colors: ['#49C9C3', '#FFBF3E', '#9DD30D', '#DA7D2A', '#39B54A', '#1CC4F5', '#1C95BD', '#5674B9', '#8560A8', '#9999FF'],
              colors: ['#5D9CEC', '#62C87F', '#F15755', '#FC863F', '#7053B6', '#FFCE55', '#6ED5E6', '#F57BC1', '#DCB186', '#647C9D'],
//            colors: ['#1bd0dc', '#f9b700', '#eb6100', '#009944','#eb6877'],
            //设置highcharts的中文值，如月份、星期、按钮文字等，可用多语言形式表示
            lang: {                                
                months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                shortMonths: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                weekdays: ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
                resetZoom: '查看全图',
                resetZoomTitle: '查看全图',
                downloadPNG: '下载PNG',
                downloadJPEG: '下载JPEG',
                downloadPDF: '下载PDF',
                downloadSVG: '下载SVG',
                exportButtonTitle: '导出成图片',
                printButtonTitle: '打印图表', 
                loading: '数据加载中，请稍候...'            
            },
            chart: {
                borderWidth: 0,
                selectionMarkerFill : 'rgba(122, 201, 67, 0.25)',
                style:{
                    fontFamily: 'Tahoma, "microsoft yahei", 微软雅黑, 宋体;'
                },
                resetZoomButton: {
                    theme: {
                        fill: 'white',
                        stroke: 'silver',
                        r: 0,
                        states: {
                            hover: {
                                fill: '#41739D',
                                style: {
                                    color: 'white'
                                }
                            }
                        }
                    }
                }
            },
            xAxis: {
                startOnTick: false,
                lineColor: '#6a7791',
                lineWidth: 1,
                tickPixelInterval: 150,
                tickmarkPlacement: 'on',
                showLastLabel: true,
                endOnTick: true
            },
            yAxis: {
                title: {
                    text: ''       
                },
                min: 0,
                gridLineColor: '#eae9e9',
                showFirstLabel: false
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    innerSize: '45%',
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false,
                        color: '#000000',
                        connectorColor: '#000000'
                    }
                },
                series: {
                    pointPalcement: 'on',
                    fillOpacity: 0.1,
                    shadow: false,
                    dataLabels: {
                        enabled: true 
                    },
                    marker: {
                        enabled: true,
                        radius: 4,
                        fillColor: null,
                        lineWidth: 2,
                        lineColor: '#FFFFFF',
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                }             
            },
            legend: {
                borderWidth: 0,
                verticalAlign: 'bottom',
                maxHeight: 57 

            },
            tooltip: {                
                borderColor: '#666',
                borderWidth: 1,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                useHTML: true,
                crosshairs: {
                    color: '#7ac943',
                    dashStyle: 'shortdot'
                },
                shared: true
            },
            credits: {
                enabled: false,
                href: 'http://www.cditv.com',
                text: 'cditv.cn',
                position: {
                    align: 'right',
                    x: -10,
                    verticalAlign: 'bottom',
                    y: 0
                }     
            }             
        };
        //设置Highcharts配置选项
        Highcharts.setOptions(defOptions);
     },
    
     //获取yAxis的配置信息
     getMainYAxis : function (){
	return $.isArray(this._chartOptions.yAxis)? this._chartOptions.yAxis[0]: this._chartOptions.yAxis;
     },
     //转换日期
     toDate : function (obj){
	var d = new Date(obj);
	return isNaN(d) ? obj : d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
     },
     //格式化数据
     formatValue : function(dataFormat, value){
    	dataFormat = parseInt(dataFormat);

    	switch(dataFormat){
        case 1:
            value =  Highcharts.numberFormat(value, 0);
            break;
        case 2:
            value =  Highcharts.numberFormat(value, this.defaults.floatDecimal);
            break;
        case 3:
            value =  Highcharts.numberFormat(value, this.defaults.floatDecimal);
            break;
        case 4:
            var toTimeDesc = function(t){
                var h = parseInt(t / 3600);
                var m = '00' + parseInt((t % 3600) / 60);
                var s = '00' + parseInt(t % 3600 % 60);
                m = m.substr(m.length - 2, 2);
                s = s.substr(s.length - 2, 2);

                return h + ':' + m + ':' + s;
            };

            value = toTimeDesc(value);						//处理时间格式为时分秒格式H:mm:ss
            break;
        case 5:
            value =  Highcharts.numberFormat(value * 100, this.defaults.floatDecimal);
            break;

        case 7:
            if(value >= 1 || value <= -1){
                value = Highcharts.numberFormat(value, 0);
            }else{
                value = Highcharts.numberFormat(value, this.defaults.floatDecimal);
            }
    	}
    	return value;
    },
    drawPlotLine:function(){
	if (c.defaults.minY >= c.defaults.maxY){
            return;
        }
        var midY = (c.defaults.maxY - c.defaults.minY) / 2;
        mainYAxis.plotLines = [{dashStyle: 'longdashdot', color: 'red', width: 1, value: midY, label:{text:'中位线'}}]; 
    },
    convertToDate:function(strDate){
    	var sDate = strDate.replace(/(^\s+|\s+$)/g,''); //去两边空格;
    	if(sDate==''){
        	return null;
    	}
    	var s = sDate.replace(/[\d]{4,4}[\-/]{1}[\d]{1,2}[\-/]{1}[\d]{1,2}/g, '');
    	if (s == ''){
        	var t=new Date(sDate.replace(/\-/g,'/'));
        	var ar = sDate.split(/[-/:]/);
        	if(ar[0] == t.getFullYear() && ar[1] == t.getMonth() + 1 && ar[2] == t.getDate()){
            		return t;
        	}
    	}
    	return null;
    },
    createChart : function (containerId,options) {
		var c = this;
		//合并数据和配置选项
		c.defaults.series = [];//合并前要清空数据,否则画多个图的时候会有脏数据
		options = $.extend(true, c.defaults, options);
		//设置图表样式主题
		c.setChartTheme(options.theme);
		//设置图表样式高度
		options.height ? containerId.css('height', options.height):null;
	
		c._chartOptions = options.chartOptions;
		//获取图表类型
		var defaultChartType = c.defaultChartTypes[options.chartType] || 'line';
		if(typeof(c._chartOptions.chart.type)!='undefined' && 
			typeof(c._chartOptions.chart.type)!= null &&
			typeof(c._chartOptions.chart.type)!= ''){
			c._chartOptions.chart.type =  c._chartOptions.chart.type ;
		}else{
			c._chartOptions.chart.type = defaultChartType;
		}

		//设置图表的标题
		(typeof options.title == 'object') ? c._chartOptions.title = options.title :  c._chartOptions.title.text = options.title;
		//设置显示图例
		c._chartOptions.legend.enabled = options.enableLegend;
	
		c._chartOptions.series = c.toHighChartSeriesData(options.series);

		//oh my god,这里没数据就退出，设置当前样式和提示
		if (!c.defaults.hasData){
		    containerId.addClass(options.setNoDataCss);
		    containerId.html('<H4>' + c._chartOptions.title.text + options.setNodateText + '</H4>');
		    return;
		}
		//categories没有设置，默认设置为饼状图
		if(!options.categories) {
			c._chartOptions.chart.type = 'pie';			//如options.categories为空，默认为饼图
		}
	
		//图表类型不为饼状图，设置X轴数据
		if (options.categories && c._chartOptions.chart.type != 'pie'){
		    var isDateTime = false;
		    var stepLen = 0;					//类别名的最大长度，用于自动计算x轴步长
		    var index = 0;

		    for(var i in options.categories){
			var cate = options.categories[i];
		      	if(typeof(cate) == 'string'){
		      		stepLen < cate.length && (stepLen = cate.length);
		      	}
			
			//根据数组第一个值来判断X轴类型
			if (index == 0){
            			var strDate = options.categories[i].toString();
            			isDateTime = c.isDate(strDate);				
				index++;
			}
		    }
		    //智能识别日期类型
		    options.autoxAxisDataType && isDateTime && (c._chartOptions.xAxis.type = 'datetime');
	    	    if (c._chartOptions.xAxis.type !== 'datetime'){
	    	    	c._chartOptions.xAxis.categories = c.toHighChartCategories(options.categories);
    	
       			//智能判断x轴的标签步长
			var labelWidth = stepLen * 6 + 50;			//每个标签所占的宽度
			if (options.autoStep){
			    var interval = c._chartOptions.xAxis.tickInterval || 1;
			    //计算设置步长
			    c._chartOptions.xAxis.labels.step = Math.ceil(c._chartOptions.xAxis.categories.length / (containerId.css('width').replace(/[^\d\.]/g,'') / labelWidth) / interval);
			}
		    }
		    else{
			//如果是日期格式，设置X轴线性数据，以便使用zoom功能，且间隔为一天
			var oneDay = 24 * 3600 * 1000;
       			// _chartOptions.plotOptions.series.pointStart = startDate;
			c._chartOptions.plotOptions.series.pointInterval = oneDay;
			//最大隔7天
			c._chartOptions.xAxis.maxZoom = options.xAxisMaxZoom * oneDay;
			c._chartOptions.xAxis.labels = c._chartOptions.xAxis.labels || {};
			c._chartOptions.xAxis.labels.formatter = c._chartOptions.xAxis.labels.formatter || function(){
			        var d = new Date(this.value);
			        //格式化时间失败直接返回this.value
			        var result = isNaN(d) ? this.value : (d.getMonth() + 1) + '-' + d.getDate();
			        return result;
			};       
			
			c._chartOptions.xAxis.tickInterval = oneDay;
			var labelWidth = 60;
			//计算设置步长
			c._chartOptions.xAxis.labels.step = Math.ceil(options.categories.length / (containerId.css('width').replace(/[^\d\.]/g,'') / labelWidth));
	     
		    }
		    
		    //手动指定x轴的间距
		    if (options.xAxisLabelStep > 0){
		    	c._chartOptions.xAxis.labels.step = options.xAxisLabelStep;
		    }
		}
		//获取yAxis的配置信息
		mainYAxis = c.getMainYAxis();
		mainYAxis.dataFormat = mainYAxis.dataFormat || options.dataFormat;
		//Y轴最大、最小值
       
		if (options.yMin != null && options.yMax != null){
			c.defaults.minY = options.yMin;
			c.defaults.maxY = options.yMax;
			mainYAxis.min = options.yMin;
			mainYAxis.max = options.yMax;
		}

		//调整Y轴数据格式
		mainYAxis.labels = mainYAxis.labels || {};

		//处理百分比格式
		if (mainYAxis.dataFormat == 3){
			c._chartOptions.tooltip.valueSuffix = '%';
		}

		if (c._chartOptions.tooltip.valueSuffix){
			mainYAxis.labels.formatter = function(){
				var value = (mainYAxis.dataFormat == 5)?  Highcharts.numberFormat(this.value * 100, options.floatDecimal) : this.value;
				return value + c._chartOptions.tooltip.valueSuffix;
			};
		}
		if (mainYAxis.dataFormat == 4){
			//转成时分秒格式H:mm:ss
			mainYAxis.labels.formatter = function(){
				return c.formatValue(mainYAxis.dataFormat, this.value);
			};
		}

		if (options.labelFormat == 0){
			c._chartOptions.plotOptions.series.dataLabels.enabled = false;
		}else{
			c._chartOptions.plotOptions.series.dataLabels.enabled = true;
			c._chartOptions.plotOptions.series.dataLabels.formatter = c._chartOptions.plotOptions.series.dataLabels.formatter || function(){
				return c.formatValue(mainYAxis.dataFormat, options.floatDecimal);
			}		
		}
		switch(options.labelFormat){
			case 0:
				c._chartOptions.plotOptions.series.dataLabels.enabled = false;
				break;
			case 1:
				c._chartOptions.plotOptions.series.dataLabels.formatter = c._chartOptions.plotOptions.series.dataLabels.formatter || function(){
					return c.formatValue(mainYAxis.dataFormat, options.floatDecimal);
				}
				break;
			case 2:
				c._chartOptions.plotOptions.series.dataLabels.formatter = c._chartOptions.plotOptions.series.dataLabels.formatter || function(){
					return Highcharts.numberFormat(this.percentage, options.floatDecimal) + '%';
				}
			break;
		default:
			c._chartOptions.plotOptions.series.dataLabels.enabled = false;
			break;
		}

		options.showPlotLine && c.drawPlotLine();

		//自定义tooltip
		c._chartOptions.tooltip = c._chartOptions.tooltip || {};
			if (c._chartOptions.chart.type != 'pie'){
				c._chartOptions.tooltip.formatter = function(){
					var yName = mainYAxis.name ? ' (' + mainYAxis.name + ')' : '';			//显示自定义的Y轴名称
					var xName = isDateTime ? c.toDate(this.x) : this.x;
					var s = '<div style="padding:5px;"><b>' + xName + yName + '</b></div><table style="width: 150px">';                
					$.each(this.points, function(i, point) {
						var value = c.formatValue(mainYAxis.dataFormat, point.y);
						var suffix = c._chartOptions.tooltip.valueSuffix || '';
			    var title =  point.series.name;
			    if (options.isCompareSeries){
			        var subTitle = point.key;
			        if (c.isDate(point.key)){
			            //var d = new Date(point.key);
			            var d = c.convertToDate(point.key);
			        	subTitle = (d.getMonth() + 1) + '-' + d.getDate();
			        }

			        title += ' (' + subTitle + ')';
			    }
						s += '<tr><td style="padding: 2px 5px" >' + title + ' </td>' 
						   + '<td style="text-align: right;padding-left:15px">' + value + suffix + ' </td></tr>';
						});           
						s += '</table>';
						return s;
					};
			}else{
				//饼图tooltip默认显示百分比
				c._chartOptions.tooltip.shared = false;
				c._chartOptions.tooltip.useHTML= false;
				c._chartOptions.tooltip.formatter =  c._chartOptions.tooltip.formatter || function() {
				return '<b>'+ this.point.name +'</b>: '+ Math.round(this.percentage * 100) / 100 +' %'; 
			    };
			}	

			c._chartOptions.chart.renderTo = containerId.attr('id');
			var chart = new Highcharts.Chart(c._chartOptions);

		}
}
;(function ($) {
        $.fn.loadChart = function (cgi,postData,opts){
        	var containerId	= $(this);
			$("#progressBar").show(200);
			$.ajax({	
				type: "POST",
		  		url: cgi,
		  		data: postData,
		    		dataType: "json",
		    		success: function(msg){
					$("#progressBar").hide(200);
					$(this).empty();
				
					var options = {};
					if(typeof(msg.chartOptions) != 'undefined' && msg.chartOptions != '' && msg.chartOptions != null) {
						options = {
							chartOptions : msg.chartOptions
						};
					}
				
					if(typeof(msg.enableLegend) != 'undefined' && msg.enableLegend != '' && msg.enableLegend != null) {
	
						options['enableLegend'] = msg.enableLegend;
					}
					options = $.extend(true, options, opts);
					//如果自定义了使用自定义的title否则
					if(typeof(opts) == 'object'){
						var title = opts.title =='' ?  msg.title : opts.title;
					}else{
						var title = msg.title;
					}
					options.title = {text : title, useHTML : true};
					var _opt = {
							chartType : msg.chartType || 'line',
							categories : msg.categories,
							series : msg.series,
							title : msg.title,
				        isCompareSeries:msg.isCompareSeries,
							dataFormat: msg.dataFormat || '1'
					};
					_opt = $.extend(true, _opt, options);
					angerJsChart.createChart(containerId,_opt);
			    	}
		  	});
	};
	$.fn.createAngerJsChart = function (opts){
		angerJsChart.createChart($(this),opts);
		
	};
})(jQuery);
