---
title: 获取spring中的bean
excerpt: 获取spring中的bean的常用方式
date: 2016-10-01 09:00:00
categories: Spring
tags:
  - bean
---

##### 有时候在各种情况下，需要注入spring 管理的bean，可以通过 一下3种方式。

###### 1.通过WebApplicationContextUtils得到得到 ApplicationContext ,需要传入ServletContext 上下文

     ApplicationContext application=WebApplicationContextUtils.getWebApplicationContext(servletContext);  

###### 2.以静态变量保存 ApplicationContext 不过该类需要在spring中实例化注入ApplicationContext, 静态变量不能注入 但是setXX 方式可以注入。

    <bean class="SpringContextHolder"/>
     
    import java.util.Map;
    import org.springframework.context.ApplicationContext;
    import org.springframework.context.ApplicationContextAware;
    
    public class SpringContextHolder implements ApplicationContextAware {
    
    	private static ApplicationContext applicationContext;
    
    	// 实现ApplicationContextAware接口的context注入函数, 将其存入静态变量.
    	@Override
    	public void setApplicationContext(ApplicationContext applicationContext) {
    		SpringContextHolder.applicationContext = applicationContext;
    	}
    
    	// 取得存储在静态变量中的ApplicationContext.
    	public static ApplicationContext getApplicationContext() {
    		checkApplicationContext();
    		return applicationContext;
    	}
    
    	// 从静态变量ApplicationContext中取得Bean, 自动转型为所赋值对象的类型.
    	@SuppressWarnings("unchecked")
    	public static <T> T getBean(String name) {
    		checkApplicationContext();
    		return (T) applicationContext.getBean(name);
    	}
    
    	// 从静态变量ApplicationContext中取得Bean, 自动转型为所赋值对象的类型.
    	// 从静态变量ApplicationContext中取得Bean, 自动转型为所赋值对象的类型.
    	// 如果有多个Bean符合Class, 取出第一个.
    	@SuppressWarnings("unchecked")
    	public static <T> T getBean(Class<T> clazz) {
    		checkApplicationContext();
    		@SuppressWarnings("rawtypes")
    		Map beanMaps = applicationContext.getBeansOfType(clazz);
    		if (beanMaps != null && !beanMaps.isEmpty()) {
    			return (T) beanMaps.values().iterator().next();
    		} else {
    			return null;
    		}
    	}
    
    	private static void checkApplicationContext() {
    		if (applicationContext == null) {
    			throw new IllegalStateException("applicaitonContext未注入,请在applicationContext.xml中定义SpringContextHolder");
    		}
    	}
    
    }

###### 3.使用spring提供的工具方法，可以将不受spring 管理的bean 被纳入管理

     SpringBeanAutowiringSupport.processInjectionBasedOnCurrentContext(x.class);