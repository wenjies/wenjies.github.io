---
title: spring整合ActiveMQ
excerpt: spring整合ActiveMQ的例子
date: 2016-12-13 09:00:00
categories: Spring
tags:
  - 整合
---

###### spring 整合 ActiveMQ xml如下：

    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
    	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:p="http://www.springframework.org/schema/p"
    	xmlns:context="http://www.springframework.org/schema/context"
    	xmlns:aop="http://www.springframework.org/schema/aop" xmlns:tx="http://www.springframework.org/schema/tx"
    	xsi:schemaLocation="http://www.springframework.org/schema/beans  
               http://www.springframework.org/schema/beans/spring-beans-3.2.xsd  
               http://www.springframework.org/schema/aop   
               http://www.springframework.org/schema/aop/spring-aop-3.2.xsd  
               http://www.springframework.org/schema/tx  
               http://www.springframework.org/schema/tx/spring-tx-3.2.xsd  
               http://www.springframework.org/schema/context  
               http://www.springframework.org/schema/context/spring-context-3.2.xsd"
    	default-autowire="byName" default-lazy-init="false">
    
    
    	<!-- 第三方MQ工厂: ConnectionFactory -->
    	<bean id="targetConnectionFactory" class="org.apache.activemq.ActiveMQConnectionFactory">
    		<!-- ActiveMQ服务地址 -->
            <property name="brokerURL" value="${activemq.brokerURL}" />
            <property name="userName" value="${activemq.userName}"></property>
            <property name="password" value="${activemq.password}"></property> 
    	</bean>
    	
        <!-- 
        	ActiveMQ为我们提供了一个PooledConnectionFactory，通过往里面注入一个ActiveMQConnectionFactory
        	可以用来将Connection、Session和MessageProducer池化，这样可以大大的减少我们的资源消耗,要依赖于 activemq-pool包
         -->
    	<bean id="pooledConnectionFactory" class="org.apache.activemq.pool.PooledConnectionFactory">
    		<property name="connectionFactory" ref="targetConnectionFactory" />
    		<property name="maxConnections" value="${activemq.pool.maxConnections}" />
    	</bean>
    
    	<!-- Spring用于管理真正的ConnectionFactory的ConnectionFactory -->
    	<bean id="connectionFactory" class="org.springframework.jms.connection.SingleConnectionFactory">
    		<!-- 目标ConnectionFactory对应真实的可以产生JMS Connection的ConnectionFactory -->
    		<property name="targetConnectionFactory" ref="pooledConnectionFactory" />
    	</bean>
    	
    	<!-- Spring提供的JMS工具类，它可以进行消息发送、接收等 -->
    	
    	<!-- 队列模板 -->
    	<bean id="jmsTemplate" class="org.springframework.jms.core.JmsTemplate">  
    	    <!-- 这个connectionFactory对应的是我们定义的Spring提供的那个ConnectionFactory对象 -->  
    	    <property name="connectionFactory" ref="connectionFactory"/>  
    	    <property name="defaultDestinationName" value="${activemq.queueName}"></property>
    	</bean> 
    	
    	<!--这个是目的地:mailQueue -->
    	<bean id="mailQueue" class="org.apache.activemq.command.ActiveMQQueue">
    		<constructor-arg>
    			<value>${activemq.queueName}</value>
    		</constructor-arg>
    	</bean>
    
    	<!-- 配置自定义监听：MessageListener -->
    	<bean id="mailQueueMessageListener" class="bhz.mq.MailQueueMessageListener"></bean>
    
    	<!-- 将连接工厂、目标对了、自定义监听注入jms模板 -->
    	<bean id="sessionAwareListenerContainer" class="org.springframework.jms.listener.DefaultMessageListenerContainer">
    		<property name="connectionFactory" ref="connectionFactory" />
    		<property name="destination" ref="mailQueue" />
    		<property name="messageListener" ref="mailQueueMessageListener" />
    	</bean>
    </beans>