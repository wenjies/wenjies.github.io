---
title: rocketmq初步学习
excerpt: Apache RocketMQ 是一款低延迟、高并发、高可用、高可靠的分布式消息中间件。消息队列 RocketMQ 可为分布式应用系统提供异步解耦和削峰填谷的能力，同时也具备互联网应用所需的海量消息堆积、高吞吐、可靠重试等特性。
date: 2017-09-08 09:00:00
categories: MQ
tags:
  - rocketmq
---

# RocketMq
----------------

### RocketMq 特色

1. 强大的消息重试机制
2. 支持 mqadmin 命令管理
3. 模式 多Master no slave、多Master 多 slave
4. 主从策略：同步双写，异步复制
5. 刷盘策略：同步刷盘，异步刷盘（是本节点内 index、 store,commitLong的数据同步）

### RocketMq 与业术语

1. Producer: 消息生产者，负责产生消息，一般由业务系统负责产生消息。
2. Consumer: 消息消费者，负责消费消息，一般是后台系统负责异步消费。
3. Push Consumer: Consumer 的一种，应用通常吐 Consumer 对象注册一个 Listener 接口，一旦收到消息，Consumer 对象立
4. Push Consumer: Consumer 的一种，应用通常吐 Consumer 对象注册一个 Listener 接口，一旦收到消息，Consumer 对象立刻回调
   Listener 接口方法。
5. Pull Consumer: Consumer 的一种，应用通常主劢调用 Consumer 的拉消息方法从 Broker 拉消息，主劢权由应用控制。
6. Producer Group: 一类 Producer 的集合名称，返类 Producer 通常収送一类消息，丏収送逡辑一致。
7. Consumer Group 一类 Consumer 的集合名称，返类 Consumer 通常消费一类消息，丏消费逡辑一致。
8. Broker: 消息中转角色，负责存储消息，转収消息，一般也称为 Server。在 JMS 规范中称为 Provider。
9. 广播消费: 一条消息被多个 Consumer 消费， 即使返些 Consumer 属亍同一个 Consumer Group， 消息也会被 Consumer Group 中的每个
   Consumer 都消费一次， 广播消费中的 Consumer Group 概念可以讣为在消息划分方面无意义。在 CORBA Notification
   规范中，消费方式都属亍广播消费。 项目开源主页：https://github.com/alibaba/RocketMQ
10. 集群消费 一个 Consumer Group 中的 Consumer 实例平均分摊消费消息。例如某个 Topic 有 9 条消息，其中一个Consumer Group 有
    3 个实例（可能是 3 个迕程，戒者 3 台机器） ，那举每个实例只消费其中的 3 条消息。在 CORBA Notification 规范中，无此消费方式。在
    JMS 规范中，JMS point-to-point model 不乀类似，但是 RocketMQ 的集群消费功能大等亍 PTP 模型。
    因为RocketMQ单个Consumer Group内的消费者类似亍PTP， 但是一个Topic/Queue可以被多个Consumer
    Group 消费。
11. 一个主题下默认有4个Quene 可以修改：p.createTopic
12. 主从实时：保证主节点挂了，也能及时消费该节点的数据，而不用等主节点恢复。

### RocketMq发送消息例子

**`普通消息`**

	public static void main(String[] args) throws Exception {
		DefaultMQProducer producer = new DefaultMQProducer("producer");
		producer.setNamesrvAddr("127.0.0.1:9876");
		producer.setRetryTimesWhenSendAsyncFailed(5);//失败重试次数
		producer.start();
		Message msg = new Message("topic1", "tag1", "key1", ("mess body").getBytes());
		SendResult sendResult = producer.send(msg);//发送失败 内部自动，重试没有抛异常即为成功。
		System.out.println(sendResult);
		producer.shutdown();
	}


	public static void main(String[] args) throws MQClientException {
		DefaultMQPushConsumer consumer=new DefaultMQPushConsumer("consumer");
		consumer.setNamesrvAddr("127.0.0.1:9876");
		consumer.setConsumeFromWhere(ConsumeFromWhere.CONSUME_FROM_FIRST_OFFSET);
		consumer.subscribe("topic1", "tag1|tag2|tag1");
		consumer.registerMessageListener(new MessageListenerConcurrently() {
			public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> msgs, ConsumeConcurrentlyContext context) {
				for (MessageExt mes : msgs) {
					System.out.println(new String(mes.getBody()));
				}
				return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
			}
		});
		consumer.start();
	}

**`顺序消息`**

	public static void main(String[] args) throws Exception {
		DefaultMQProducer producer = new DefaultMQProducer("producer");
		producer.setNamesrvAddr("127.0.0.1:9876");
		producer.start();
		Message msg = new Message("topic1", "tag1", "key1", ("消息内容：aaaa").getBytes());
		//必须自己实现MessageQueueSelector 保证消息进入同一个队列 arg 队列下标	
		SendResult sendResult = producer.send(msg,new MessageQueueSelector(){
			public MessageQueue select(List<MessageQueue> mqs, Message msg, Object arg) {
				return mqs.get((Integer)arg);
			}
			
		},0);
		System.out.println(sendResult);
		producer.shutdown();
	}


	public static void main(String[] args) throws MQClientException {
		DefaultMQPushConsumer consumer=new DefaultMQPushConsumer("consumer");
		consumer.setNamesrvAddr("127.0.0.1:9876");
		consumer.setConsumeFromWhere(ConsumeFromWhere.CONSUME_FROM_FIRST_OFFSET);
		consumer.subscribe("topic1", "*");
		consumer.setConsumeThreadMin(10);
		consumer.registerMessageListener(new MessageListenerOrderly() {
			public ConsumeOrderlyStatus consumeMessage(List<MessageExt> msgs, ConsumeOrderlyContext context) {
				for (MessageExt mes : msgs) {
					System.out.println(new String(mes.getBody()));
				}
				return ConsumeOrderlyStatus.SUCCESS;
			}
		});
		consumer.start();
	}

	顺序消息的实现：1.一组有顺序的消息必须放进同一个队列。
			 	  2.一个消费者的一个线程只能接收一个队列的消息 消费者必须是实现，MessageListenerOrderly的监听。

**`事务消息`**

	public static void main(String[] args) throws MQClientException {
		TransactionMQProducer producer = new TransactionMQProducer("producer");
		producer.setNamesrvAddr("127.0.0.1:9876");
		producer.setTransactionCheckListener(new TransactionCheckListener() {
			public LocalTransactionState checkLocalTransactionState(MessageExt msg) {
				return LocalTransactionState.COMMIT_MESSAGE;
			}
		});
		producer.start();
		Message msg = new Message("TransactionTopic", "tag1", "key1", ("消息: aaa a").getBytes());
		SendResult sendResult = producer.sendMessageInTransaction(msg, new LocalTransactionExecuter() {
			public LocalTransactionState executeLocalTransactionBranch(Message msg, Object arg) {
				System.out.println(msg);
				return LocalTransactionState.COMMIT_MESSAGE;
			}
		}, "回调里的Object arg");
		System.out.println(sendResult);
		producer.shutdown();
	}

	public static void main(String[] args) throws MQClientException {
		MQConsumer consumer=new MQConsumer("consumer");
		consumer.setNamesrvAddr("127.0.0.1:9876");
		consumer.setConsumeFromWhere(ConsumeFromWhere.CONSUME_FROM_FIRST_OFFSET);
		consumer.subscribe("TransactionTopic", "*");
		consumer.setMessageListener(new MessageListenerConcurrently() {
			public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> msgs, ConsumeConcurrentlyContext context) {
				for (MessageExt mes : msgs) {
					System.out.println(new String(mes.getBody()));
				}
				return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
			}
		});
		consumer.start();
	}

**`MessageFilter过滤消息`**

	public static void main(String[] args) throws Exception {
		DefaultMQProducer producer = new DefaultMQProducer("producer");
		producer.setNamesrvAddr("127.0.0.1:9876");
		producer.start();
		Message msg = new Message("topic1", "tag1", "key1", ("mess body").getBytes());
		SendResult sendResult = producer.send(msg);
		System.out.println(sendResult);
		producer.shutdown();
	}

	public static void main(String[] args) throws MQClientException {
		DefaultMQPushConsumer consumer=new DefaultMQPushConsumer("consumer");
		consumer.setNamesrvAddr("127.0.0.1:9876");
		consumer.setConsumeFromWhere(ConsumeFromWhere.CONSUME_FROM_FIRST_OFFSET);
		String code = MixAll.file2String("H:/code/mq/src/main/java/rocketmq/apt/MesFilter.java");
		consumer.subscribe("topic1","rocketmq.apt.MesFilter",code);
		consumer.setConsumeThreadMin(10);
		consumer.registerMessageListener(new MessageListenerConcurrently() {
			public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> msgs, ConsumeConcurrentlyContext context) {
				for (MessageExt mes : msgs) {
					System.out.println(new String(mes.getBody()));
				}
				return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
			}
		});
		consumer.start();
	}

	public class MesFilter implements MessageFilter{
		public boolean match(MessageExt msg) {
			return false;//Determines whether this message is entered fileter
		}
	
	}

	注意： MesFilter中不能有汉字

### 注意事项

1. 可能出现重复消息，消费先做判断。
2. pull类消费,无重试机制（PullMessageService、DefaultMQPullConsumer）
3. 先启动提供者 消费者可能会一次拿多条消息。
4. 一定要先启动消费者，再启动生产者 可以避免很多问题。
5. 消费消息时：
   1、若mq里有一堆消息那么消费者可能会批量消费 ，可以设置最大消费量为1限制。 （这样好返回消息失败状态，而不是批量状态。避免重复消费）
   2、消费消息后 可以返回消息状态
   3、没有返回消息状态的消息会不断重发 无次数限制。
   4、若返回消息状态是稍后再试，会根据默认 1s、2s、5s...2h发送。
   消息里有重试次数 （若不想一直重试，可以在重试 多少次后记录日志，返回成功标志。）
   5、可以设置负载均很、
6. 先启动提供者 在启动 消费者1 在启动消费者2 可能重复消费（1在处理 没有返回，mq会再把消息发给 2）

]()