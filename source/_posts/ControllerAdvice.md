---
title: "spring mvc advice"
excerpt: ControllerAdvice 除了可以完成全局异常的处理，同时也可以在真正调用方法之前对body 中的请求参数进行处理，以及在对body 数据相应写回之前对数据进行处理；
date: 2017-09-14 09:00:00
category: Spring
tags:
  - mvc
---

**`ControllerAdvice`** 除了可以完成全局异常的处理，同时也可以在真正调用方法之前对body 中的请求参数进行处理，以及在对body 数据相应写回之前对数据进行处理；

1. Controller的增强
2. 每个请求都会进入
3. @ExceptionHandler(Exception.class) 可以有多个但是，捕获的异常不能一样，@Controller中的 @ExceptionHandler覆盖
   @ControllerAdvice中的 @ExceptionHandler可以看作就近原则。

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
