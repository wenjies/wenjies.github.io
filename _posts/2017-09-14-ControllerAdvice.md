---
layout: post
title: "ControllerAdvice"
date: 2017-09-14 09:00:00 +0800 
categories: Spring 
tag: controller
---
* content
{:toc}
<!-- more -->
## ControllerAdvice  

**`ControllerAdvice`** 
1. Controller的增强
2. 每个请求都会进入
3. @ExceptionHandler(Exception.class) 可以有多个但是，捕获的异常不能一样，@Controller中的 @ExceptionHandler覆盖 @ControllerAdvice中的  @ExceptionHandler可以看作就近原则。

**`2.具体说明`** 

	@ControllerAdvice
	public class ExceptionAdvice {
	
		@ModelAttribute
		public Object addObject() {
			return new Object();
		}
	
		@InitBinder
		public void initBinder(WebDataBinder binder) {
		}
	
		@ExceptionHandler(Exception.class)
		public ModelAndView proceException(HttpServletRequest request, HttpServletResponse response,Exception ex) {
			ex.printStackTrace();
			ModelAndView modelAndView = new ModelAndView();
			if ((request.getHeader("accept").contains("application/json") || (request.getHeader("X-Requested-With") != null && request.getHeader("X-Requested-With").contains("XMLHttpRequest")))) {
				response.setCharacterEncoding("UTF-8");
				try {
					response.getWriter().print(JSON.toJSONString(" is ajax "));
					response.flushBuffer();
				} catch (IOException e) {
					e.printStackTrace();
				}
				return null;
			} else {
				modelAndView.setViewName("err");
				return modelAndView;
			}
		}
	}
