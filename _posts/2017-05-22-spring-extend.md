---
layout: post
title: "Spring扩展"
date: 2017-05-22 09:00:00 +0800 
categories: Spring
tag: spring
---
* content
{:toc}

<!-- more -->

# Spring扩展
----------------
### 为什么要扩展
1.	做java开发Spring是必须要用的而且用的很频繁。
2.	Spring的核心IOC和AOP是我们最想要的，但是有些时候需要把我们自定义的bean的生产过程，bean创建好之后再交给Spring容器。所以重点来了怎么交给它
3.	其实Spring的设计早就考虑到这些问题了，只是平时没怎么使用而已，本文带你解开它神秘的面纱。
 
# 理论加实践
----------------
### 1.使用Component注解
1.	想让Spring扫描我们自定义的注解很简单。只需要在我们的注解上加上 @org.springframework.stereotype.Component 代码如下:

```
    @Component
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE)
    public @interface MyService {
    	String value() default "";// 必须要有
    }
```

以上就可以让Spring扫描到我们的注解，作用和Spring的注解作用是一样的。 细心的同学可能已经发现 org.springframework.stereotype.Controller 的注解不就是这样实现的嘛。
让我们来看看这是为什么,在 org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider类中的registerDefaultFilters 方法中有
this.includeFilters.add(new AnnotationTypeFilter(Component.class))这样一句话，看到这里明白了吧 。代码如下：

```
@SuppressWarnings("unchecked")
protected void registerDefaultFilters() {
	this.includeFilters.add(new AnnotationTypeFilter(Component.class));
	ClassLoader cl = ClassPathScanningCandidateComponentProvider.class.getClassLoader();
	try {
		this.includeFilters.add(new AnnotationTypeFilter(
				((Class<? extends Annotation>) ClassUtils.forName("javax.annotation.ManagedBean", cl)), false));
		logger.debug("JSR-250 'javax.annotation.ManagedBean' found and supported for component scanning");
	}
	catch (ClassNotFoundException ex) {
		// JSR-250 1.1 API (as included in Java EE 6) not available - simply skip.
	}
	try {
		this.includeFilters.add(new AnnotationTypeFilter(
				((Class<? extends Annotation>) ClassUtils.forName("javax.inject.Named", cl)), false));
		logger.debug("JSR-330 'javax.inject.Named' annotation found and supported for component scanning");
	}
	catch (ClassNotFoundException ex) {
		// JSR-330 API not available - simply skip.
	}
}
```
你以为这样就完了嘛？如果仅仅是装个x确实完了，被他注解的类会被Spring管理。 但是对于我们来讲是不够滴，应为我们还要定义这个bean的生产过程呀！这才是真正的目的。代码如下：

```
@Component
public class MyBeanPostProcessor implements BeanPostProcessor {
	public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
		System.out.println("postProcessAfterInitialization  "+ beanName);
		return bean;
	}

	public Object postProcessBeforeInitialization(``````Object bean, String beanName) throws BeansException {
		System.out.println("postProcessBeforeInitialization "+ beanName);
		return bean;
	}
}
```
BeanPostProcessor接口作用是：如果我们需要在Spring容器完成Bean的实例化、配置和其他的初始化前后添加一些自己的逻辑处理，我们就可以定义一个或者多个BeanPostProcessor接口的实现，然后注册到容器中。两个方法一个之前 一个之后。注册到容器时两个方法都会调，获取的时会调postProcessBeforeInitialization方法。我们可以在这里把bean在定制一番,怎么定制就看个人需求啦不再讲述。听SpringMvc就是采用的这种策略，没去验证过。第一种方法就介绍完了。

### 2.扫描包解析注解
1.	先定义注解代码如下： 

``` 
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Component {
	String value() default "";
}
	
```

2.	扫描 既然用到了Spring那么就让Spring来帮我们扫描代码如下：
 
```
import java.util.Set;
import org.springframework.beans.factory.annotation.AnnotatedBeanDefinition;
import org.springframework.beans.factory.config.BeanDefinitionHolder;
import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.beans.factory.support.GenericBeanDefinition;
import org.springframework.context.annotation.ClassPathBeanDefinitionScanner;
import org.springframework.core.type.filter.AnnotationTypeFilter;

public final class Scanner extends ClassPathBeanDefinitionScanner {

	public Scanner(BeanDefinitionRegistry registry) {
		super(registry);
	}

	public void registerDefaultFilters() {
		this.addIncludeFilter(new AnnotationTypeFilter(Component.class));
	}

	public Set<BeanDefinitionHolder> doScan(String... basePackages) {
		//super.doScan(basePackages) 会把生成的bean 加入Spring容器
		Set<BeanDefinitionHolder> beanDefinitions = super.doScan(basePackages);
		for (BeanDefinitionHolder holder : beanDefinitions) {
			GenericBeanDefinition definition = (GenericBeanDefinition) holder.getBeanDefinition();
			// beanClassName给FactoryBeanImpl使用，还以再加几个Property
			definition.getPropertyValues().add("beanClassName", definition.getBeanClassName()); 
			definition.setBeanClass(FactoryBeanImpl.class);
		}
		return beanDefinitions;
	}

	public boolean isCandidateComponent(AnnotatedBeanDefinition beanDefinition) {
		return super.isCandidateComponent(beanDefinition) 
					&& (beanDefinition.getMetadata().hasAnnotation(Component.class.getName()));
	}
}
```

上面的代码就是扫描，解析后得到的BeanDefinitionHolder 然后指定工厂FactoryBeanImpl生产后加入容器 代码如下：

```
import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.cglib.core.SpringNamingPolicy;
import org.springframework.cglib.proxy.Enhancer;

public class FactoryBeanImpl<T> implements InitializingBean, FactoryBean<T> {
	private String beanClassName;
 
	public void setBeanClassName(String beanClassName) {
		this.beanClassName = beanClassName;
	}

	public T getObject() throws Exception {
		Class innerClass = Class.forName(beanClassName);
		if (innerClass.isInterface()) {//接口使用 jdk代理
			return (T) InvocationHandlerImpl.newInstance(innerClass);
		} else {//类使用 cglib代理
			Enhancer enhancer = new Enhancer();
			enhancer.setSuperclass(innerClass);
			enhancer.setNamingPolicy(SpringNamingPolicy.INSTANCE);
			enhancer.setCallback(new MethodInterceptorImpl());
			return (T) enhancer.create();
		}
	}

	public Class<?> getObjectType() {
		try {
			return Class.forName(beanClassName);
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
		return null;
	}

	public boolean isSingleton() {
		return true;
	}

	public void afterPropertiesSet() throws Exception {
	}
}
```
	

这个属性beanClassName是上面扫描绑定过来的。这里就是生成bean的工厂。getObject是bean的生成方法，代理就略过。代码如下：

```
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
public class InvocationHandlerImpl implements InvocationHandler {
  public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
      System.out.println("ObjectProxy execute:" + method.getName());
      return method.invoke(proxy, args);
  }
  public static <T> T newInstance(Class<T> innerInterface) {
      ClassLoader classLoader = innerInterface.getClassLoader();
      Class[] interfaces = new Class[] { innerInterface };
      InvocationHandlerImpl proxy = new InvocationHandlerImpl();
      return (T) Proxy.newProxyInstance(classLoader, interfaces, proxy);
  }
}
 

import java.lang.reflect.Method;
import org.springframework.cglib.proxy.MethodInterceptor;
import org.springframework.cglib.proxy.MethodProxy;

public class MethodInterceptorImpl implements MethodInterceptor {
	public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {
		System.out.println("MethodInterceptorImpl:" + method.getName());
		return methodProxy.invokeSuper(o, objects);
	}
}
```

3.什么都做了，什么时候扫描

```
public Scanner(BeanDefinitionRegistry registry) {
    super(registry);
}
```

在实例化Scanner时需要 BeanDefinitionRegistry该类的作用主要是向注册表中注册 BeanDefinition实例 完成注册的过程。
BeanFactoryPostProcessor是在spring容器加载了bean的定义文件之后，在bean实例化之前执行的。
ConfigurableListableBeanFactory该类提供解析,修改bean定义,并与初始化单例.
在运行的时候传入的是 DefaultListableBeanFactory为 ConfigurableListableBeanFactory子类且实现了 BeanDefinitionRegistry 接口。代码如下：

```
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

public class BeanFactoryPostProcesserImpl implements BeanFactoryPostProcessor, ApplicationContextAware {
	private ApplicationContext applicationContext;

	public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
		this.applicationContext = applicationContext;
	}

	public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
		Scanner scanner = new Scanner((BeanDefinitionRegistry) beanFactory);//可以强转
		scanner.setResourceLoader(this.applicationContext);
		scanner.setBeanNameGenerator(new AnnotationBeanNameGenerator());//解析注解得到value值。
		scanner.scan("com.extend.service");//可以在xml配置进来 不再演示
	}
}

import java.beans.Introspector;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.AnnotatedBeanDefinition;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.beans.factory.support.BeanNameGenerator;
import org.springframework.core.annotation.AnnotationAttributes;
import org.springframework.core.type.AnnotationMetadata;
import org.springframework.util.ClassUtils;
import org.springframework.util.StringUtils;

public class AnnotationBeanNameGenerator implements BeanNameGenerator {

	private static final String COMPONENT_ANNOTATION_CLASSNAME = "com.extend.annotation2.Component";

	@Override
	public String generateBeanName(BeanDefinition definition, BeanDefinitionRegistry registry) {
		if (definition instanceof AnnotatedBeanDefinition) {
			String beanName = determineBeanNameFromAnnotation((AnnotatedBeanDefinition) definition);
			if (StringUtils.hasText(beanName)) {
				return beanName;
			}
		}
		return buildDefaultBeanName(definition, registry);
	}

	protected String determineBeanNameFromAnnotation(AnnotatedBeanDefinition annotatedDef) {
		AnnotationMetadata amd = annotatedDef.getMetadata();
		Set<String> types = amd.getAnnotationTypes();
		String beanName = null;
		for (String type : types) {
			AnnotationAttributes attributes = AnnotationAttributes.fromMap(amd.getAnnotationAttributes(type, false));
			// AnnotationAttributes attributes =
			// AnnotationConfigUtils.attributesFor(amd, type);
			if (isStereotypeWithNameValue(type, amd.getMetaAnnotationTypes(type), attributes)) {
				Object value = attributes.get("value");
				if (value instanceof String) {
					String strVal = (String) value;
					if (StringUtils.hasLength(strVal)) {
					  if (beanName != null && !strVal.equals(beanName)) {
						throw new IllegalStateException("Stereotype annotations suggest inconsistent "
								+ "component names: '" + beanName + "' versus '" + strVal + "'");
						}
						beanName = strVal;
					}
				}
			}
		}
		return beanName;
	}

	protected boolean isStereotypeWithNameValue(String annotationType, Set<String> metaAnnotationTypes,
			Map<String, Object> attributes) {

		boolean isStereotype = annotationType.equals(COMPONENT_ANNOTATION_CLASSNAME)
			|| (metaAnnotationTypes != null && metaAnnotationTypes.contains(COMPONENT_ANNOTATION_CLASSNAME))
			|| annotationType.equals("javax.annotation.ManagedBean") || annotationType.equals("javax.inject.Named");

		return (isStereotype && attributes != null && attributes.containsKey("value"));
	}

	protected String buildDefaultBeanName(BeanDefinition definition, BeanDefinitionRegistry registry) {
		return buildDefaultBeanName(definition);
	}

	protected String buildDefaultBeanName(BeanDefinition definition) {
		String shortClassName = ClassUtils.getShortName(definition.getBeanClassName());
		return Introspector.decapitalize(shortClassName);
	}

}
```

	

以上就是实现过程 下面是测试：

```
import com.extend.annotation2.Component;
@Component("disCaver1")
public class TestService {
	public String getName() {
		System.err.println("hello world!");
		return "hello world!";
	}
}

public class Test {
	public static void main(String[] args) throws Exception {
		ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("classpath:spring-mybatis.xml");
		context.start();
		TestService disCaver1 = (TestService) context.getBean("disCaver1");
		TestService disCaver2 = (TestService) context.getBean(TestService.class);
		disCaver1.getName();
		context.close();
	}
}
	
```
spring-mybatis.xml：

```
<?xml version="1.0" encoding="UTF-8"?>
	<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
		xmlns:context="http://www.springframework.org/schema/context" xmlns:aop="http://www.springframework.org/schema/aop"
		xmlns:tx="http://www.springframework.org/schema/tx" xmlns:dubbo="http://code.alibabatech.com/schema/dubbo" 
		xmlns:cache="http://www.springframework.org/schema/cache"
		xsi:schemaLocation="http://www.springframework.org/schema/beans    
	           http://www.springframework.org/schema/beans/spring-beans-3.0.xsd    
	           http://www.springframework.org/schema/context    
	           http://www.springframework.org/schema/context/spring-context-3.0.xsd    
	           http://www.springframework.org/schema/aop    
	           http://www.springframework.org/schema/aop/spring-aop-3.0.xsd    
	           http://www.springframework.org/schema/tx 
	           http://www.springframework.org/schema/tx/spring-tx-3.0.xsd
	           http://code.alibabatech.com/schema/dubbo 
			   http://code.alibabatech.com/schema/dubbo/dubbo.xsd">
			   <bean class="com.extend.annotation2.BeanFactoryPostProcesserImpl"/>
	</beans>
```
结果：
MethodInterceptorImpl:getName
hello world!
 
