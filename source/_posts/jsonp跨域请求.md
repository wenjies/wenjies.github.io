---
title: jsonp跨域请求
excerpt: jsonp跨域请求的使用示例
date: 2017-09-16 09:00:00
categories: AJAX
tags:
  - js 
---

## 处理跨域请求

       后台：
       
        @RequestMapping("/list2.do")
    	@ResponseBody
    	public Object list2(String callback) {
    		String str = studentService.getMessage();
    		JSONObject json = new JSONObject();
    		json.put("data", str);
    		String result=json.toJSONString();
    		 
    		if(callback!=null && !callback.equals("")){
    			MappingJacksonValue mappingJacksonValue=new MappingJacksonValue(result);
    			mappingJacksonValue.setJsonpFunction(callback);
    			return mappingJacksonValue;
    		}else{
    			return result;
    		}
    	}
    	
    	@RequestMapping("/list3.do")
    	@ResponseBody
    	public String list3(String callback) {
    		String str = studentService.getMessage();
    		JSONObject json = new JSONObject();
    		json.put("data", str);
    		String result=json.toJSONString();
    		
    		if(callback!=null && !callback.equals("")){
    			return callback +"("+result+")";
    		}else{
    			return result;
    		}
    		
    	}
    	
    	前端：
    	
    	$.ajax({  
	        data:'',
	        type:"get",
	        url:"http://www.xxxx.com/upms/user/list3.do",
	        dataType:'jsonp',				//声明采用 jsonp
	        jsonp:'callback',				//后台用 callback字符串接收。  jsonpCallback的回调函数callbackFunc的名称
	        jsonpCallback:"callbackFunc",	//callbackFunc 回调的方法 可以不要
	        success:function(result) {  
	           console.info(result);// 成功后携带数据进入。
	        },  
	        timeout:3000  
	    });  
    	function callbackFunc(datas){}// 空实现  可以不要

## 原理

1. 主要是服务器把返回数据包裹成 js文件内容。 因为js是可以跨域访问的。