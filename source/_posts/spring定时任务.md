---
title: spring定时任务
date: 2016-05-01 00:00:00
categories: Spring
tags:
  - 定时任务
---

#### spring 定时任务实现3中方式 推荐第二种

###### 1.在spring xml中定义好 scheduler，在容器中的bean 方法上加上@Scheduled注解

    xmlns:task="http://www.springframework.org/schema/task"
    
    http://www.springframework.org/schema/task 
    http://www.springframework.org/schema/task/spring-task.xsd
    
    <task:annotation-driven />
    <task:scheduled-tasks scheduler="myScheduler">  
        <task:scheduled ref="scheduledTaskManager" method="autoCardCalculate" cron="1/5 * * * * *"/>  
    </task:scheduled-tasks>  
    <task:scheduler id="myScheduler" pool-size="10"/>  
    
    @Scheduled(cron = "0/5 * * * * *" )
    public void doSomething() {
        System.err.println(Thread.currentThread().getName() + "   doSomething statrt.................");
    }

###### 2.使用注解启用 schedul，同样可以在容器中的bean 方法上加上@Scheduled注解来标识是调度，或者手动注册

    　
    @Configuration
    @EnableScheduling
    public class AppConfig implements SchedulingConfigurer {
    	@Override
    	public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
    		taskRegistrar.setScheduler(taskScheduler());
    		taskRegistrar.addTriggerTask(myTask(), new CustomTrigger("0/5 * * * * *"));
    	}
    
    	@Bean(destroyMethod = "shutdown")
    	public Executor taskScheduler() {
    		ScheduledThreadPoolExecutor scheduledThreadPoolExecutor = new ScheduledThreadPoolExecutor(5);
    		// Executor executor=new ThreadPoolExecutor(4, 10, 60L, TimeUnit.SECONDS, new LinkedBlockingQueue<Runnable>(10000));
    		return scheduledThreadPoolExecutor;
    	}
    
    	@Bean
    	public MyTask myTask() {
    		return new MyTask();
    	}
    	
    	@Scheduled(cron = "0/5 * * * * *" )
    	public void doSomething() {
    		System.err.println(Thread.currentThread().getName() + "   doSomething statrt.................");
    	}
    }
    
    class MyTask implements Runnable {
    	@Override
    	public void run() {
    		System.err.println(Thread.currentThread().getName() + "   MyTask statrt.................");
    		try {
    			Thread.sleep(10000);
    		} catch (InterruptedException e) {
    			// TODO Auto-generated catch block
    			e.printStackTrace();
    		}
    		System.err.println(Thread.currentThread().getName() + "   MyTask end.................");
    	}
    }
    
    class CustomTrigger implements Trigger {
    
    	private String cron;
    
    	CustomTrigger(String cron) {
    		this.cron = cron;
    	}
    
    	@Override
    	public Date nextExecutionTime(TriggerContext triggerContext) {
    		CronTrigger trigger = new CronTrigger(cron);
    		Date nextExec = trigger.nextExecutionTime(triggerContext);
    		return nextExec;
    	}
    }

###### 3.使用 quartz 在spring 中代码 如下

    <bean id="payTask" class="cn.bookingsmart.jp.task.OrderTask"/>
    <!-- 支付超时 -->
    <bean id="handlePayTimeout" class="org.springframework.scheduling.quartz.MethodInvokingJobDetailFactoryBean">
    	<property name="targetObject">
    		<ref bean="payTask" />
    	</property>
    	<property name="targetMethod">
    		<value>handlePayTimeout</value>
    	</property>
    	<property name="concurrent" value="false" />
    </bean>
    
    <bean id="handlePayTimeoutTrigger" class="org.springframework.scheduling.quartz.CronTriggerFactoryBean">
    	<property name="jobDetail">
    		<ref bean="handlePayTimeout" />
    	</property>
    	<property name="cronExpression">
    		<value>0 0/5 * * * ? *</value>
    	</property>
    </bean>
    
    <bean class="org.springframework.scheduling.quartz.SchedulerFactoryBean">
    	<property name="triggers">
    		<list>
    			<ref bean="handlePayTimeoutTrigger" />
    			<ref bean="handlePayErrTrigger" />
    			<ref bean="handleTicketTrigger" />
    		</list>
    	</property>
    </bean>
    
    <bean id="threadPoolTaskExecutor" class="org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor">
      <!-- 核心线程数，默认为1 -->
      <property name="corePoolSize" value="3" />
      <!-- 最大线程数，默认为Integer.MAX_VALUE -->
      <property name="maxPoolSize" value="10" />
      <!-- 队列最大长度，一般需要设置值>=notifyScheduledMainExecutor.maxNum；默认为Integer.MAX_VALUE -->
      <property name="queueCapacity" value="1000" />
      <!-- 线程池维护线程所允许的空闲时间，默认为60s -->
      <property name="keepAliveSeconds" value="300" />
      <!-- 线程池对拒绝任务（无线程可用）的处理策略，目前只支持AbortPolicy、CallerRunsPolicy；默认为后者 -->
      <property name="rejectedExecutionHandler">
          <!-- AbortPolicy:直接抛出java.util.concurrent.RejectedExecutionException异常 -->
          <!-- CallerRunsPolicy:主线程直接执行该任务，执行完之后尝试添加下一个任务到线程池中，可以有效降低向线程池内添加任务的速度 -->
          <!-- DiscardOldestPolicy:抛弃旧的任务、暂不支持；会导致被丢弃的任务无法再次被执行 -->
          <!-- DiscardPolicy:抛弃当前任务、暂不支持；会导致被丢弃的任务无法再次被执行 -->
          <bean class="java.util.concurrent.ThreadPoolExecutor$CallerRunsPolicy" />
      </property>
    </bean>
    
    
    public class OrderTask {
    	@Resource
    	private OrderService orderService;
    	@Resource
    	private QaeService qaeService;
 
    	public void handlePayTimeout() {
    	 
    	}
    	
    	public void handlePayErr() {
    		 
    	}
    	
    	public void handNoTicket() {
    		 
    	}
	
    }