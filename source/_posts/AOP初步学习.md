---
title: AOP初步学习
excerpt: AOP是一种编程范式，不是编程语言，解决特定的问题。（解决代码重复问题 、关注点分离）。
date: 2017-09-13 09:00:00
categories: Spring
tags:
  - aop
---

## AOP

**`1.什么是AOP`**

1. AOP是一种编程范式，不是编程语言，解决特定的问题。（解决代码重复问题 、关注点分离）
2. 面向切面编程（AOP是Aspect Oriented Program的首字母缩写）将应用程序切分成一个个关注点，让每一个关注点成为
   独立的，也只做一件事情，尽量不让关注点之间产生耦合。
   AOP其实只是OOP的补充而已。OOP从横向上区分出一个个的类来，而AOP则从纵向上向对象中加入特定的代码。有了AOP，OOP变得立体了。如果加上时间维度，AOP使OOP由原来的二维变为三维了，由平面变成立体了。从技术上来说，AOP基本上是通过代理机制实现的。
   这种在运行时，动态地将代码切入到类的指定方法、指定位置上的编程思想就是面向切面的编程。
3. AOP技术它利用一种称为"横切"
   的技术，剖解开封装的对象内部，并将那些影响了多个类的公共行为封装到一个可重用模块，并将其命名为"Aspect"，即切面。所谓"切面"
   ，简单说就是那些与业务无关，却为业务模块所共同调用的逻辑或责任封装起来，便于减少系统的重复代码，降低模块之间的耦合度，并有利于未来的可操作性和可维护性。使用"
   横切"
   技术，AOP把软件系统分为两个部分：核心关注点和横切关注点。业务处理的主要流程是核心关注点，与之关系不大的部分是横切关注点。横切关注点的一个特点是，他们经常发生在核心关注点的多处，而各处基本相似，比如权限认证、日志、事物。AOP的作用在于分离系统中的各种关注点，将核心关注点和横切关注点分离开来。

**`2.基本概念`**

1. 切面（Aspect）：对横切性关注点的模块化，其实就是共有功能的实现。如日志切面、权限切面等。
2. 连接点（JoinPoint）：就是程序在运行过程中能够插入切面的地点。例如，方法调用、异常抛出或字段修改等，但Spring只支持方法级的连接点。
3. 通知（Advice）：在切面的某个特定的连接点（Joinpoint）上执行的动作。通知有各种类型。
4. 切入点（Pointcut）：用于定义通知（Advice）应该切入到哪些连接点(JoinPoint)上。不同的通知通常需要切入到不同的连接点上，这种精准的匹配是由切入点的正则表达式来定义的。
5. 目标对象（Target）：就是那些即将切入切面的对象，也就是那些被通知的对象。
6. 代理对象（Proxy）：将通知应用到目标对象之后被动态创建的对象
7. 织入（Weaving）：将切面应用到目标对象从而创建一个新的代理对象的过程。

## spring AOP的使用

**`xml配置`**

    <bean id="advice" class="test.Advice" />  
    <aop:config>  
        <aop:aspect id="aspect" ref="advice">  
            <aop:pointcut id="service" expression="execution(* com.demo.aop.*.find*(..))"/>  
            <aop:before method="doBefore"  pointcut-ref="service"/>  
            <aop:after method="doAfter"  pointcut-ref="service"/>  
            <aop:around method="doAround"  pointcut-ref="service"/>  
            <aop:after-returning method="doReturn"  pointcut-ref="service"/>  
            <aop:after-throwing method="doThrowing" throwing="ex" pointcut-ref="service"/>  
              
        </aop:aspect>  
    </aop:config>

	package test;   
	import org.aspectj.lang.JoinPoint;  
	import org.aspectj.lang.ProceedingJoinPoint;  
	public class Advice {  
	    private void doBefore(JoinPoint joinPoint) {  
	       
	    }  
	    private Object doAround(ProceedingJoinPoint pjp) throws Throwable {  
	        Object retVal = pjp.proceed();  
	        return retVal;  
	    }  
	    private void doAfter(JoinPoint joinPoint) {  
	       
	    }  
	    private void doReturn(JoinPoint joinPoint) {  
	       
	    }  
	    private void doThrowing(JoinPoint joinPoint,Throwable ex) {  
	        
	    }  
	} 


	<bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
		<property name="dataSource" ref="dataSource" />
	</bean>
	<tx:advice id="txAdvice" transaction-manager="transactionManager">
		<tx:attributes>
			<tx:method name="save*" propagation="REQUIRED" />
			<tx:method name="insert*" propagation="REQUIRED" />
			<tx:method name="add*" propagation="REQUIRED" />
			<tx:method name="create*" propagation="REQUIRED" />
			<tx:method name="delete*" propagation="REQUIRED" />
			<tx:method name="update*" propagation="REQUIRED" />
			<tx:method name="find*" propagation="SUPPORTS" read-only="true" />
			<tx:method name="select*" propagation="SUPPORTS" read-only="true" />
			<tx:method name="get*" propagation="SUPPORTS" read-only="true" />
		</tx:attributes>
	</tx:advice>
 
	<aop:config>
		<aop:advisor advice-ref="txAdvice" pointcut="execution(* com.*.*.service.*.*(..))" />
	</aop:config>

**`注解配置`**

	<aop:aspectj-autoproxy/>
	
	@Aspect
	@Component
	public class MyAspect{
		
		@Pointcut("execution(* com.*.*.service.*.*(..))")  
		private void piont(){ }
		 
		@Before("piont()")
		public void beforeTest(){
			System.out.println("beforeTest.................");
		}
	
	}

	execution：用于匹配方法执行的连接点；
	within：用于匹配指定类型内的方法执行；
	this：用于匹配当前AOP代理对象类型的执行方法；注意是AOP代理对象的类型匹配，这样就可能包括引入接口也类型匹配；
	target：用于匹配当前目标对象类型的执行方法；注意是目标对象的类型匹配，这样就不包括引入接口也类型匹配；
	args：用于匹配当前执行的方法传入的参数为指定类型的执行方法；
	@within：用于匹配所以持有指定注解类型内的方法；
	@target：用于匹配当前目标对象类型的执行方法，其中目标对象持有指定的注解；
	@args：用于匹配当前执行的方法传入的参数持有指定注解的执行；
	@annotation：用于匹配当前执行方法持有指定注解的方法；
	bean：Spring AOP扩展的，AspectJ没有对于指示符，用于匹配特定名称的Bean对象的执行方法；
	reference pointcut：表示引用其他命名切入点，只有@ApectJ风格支持，Schema风格不支持。