---
title: JAVA面试总结
excerpt: Java面试总结‌
date: 2017.05.17 17:28:00
category: 经验
tags:
  - 面试
---

# 关于业务
----------------

### 自我介绍

1. 准备1-2个重点项目，简单描述项目内容 & 自己负责的模块，遇到的技术难点 &
   是如何解决的。常见的技术难点：并发问题、分布式系统一致性问题、接口幂等问题、OOM分析、redis缓存etc.
2. 自己所负责项目的各项业务的指标。例如，存量数据量级、QPS、团单成交量、公司的营业额之类的也可以关注一下，会被问到。
3. 注意点：一定要对简历上写的业务非常熟悉。面试官会对某个业务细节内容进行深入询问，也会设置某些场景要求给出解决方案。

# 关于技术
----------------

### 自我介绍

1. 自我介绍的时候可以介绍下自己比较熟悉的技术内容，从而引导面试官对自己擅长的技术进行深入提问。（e.g.我JAVA基础扎实，对JVM原理有一定的了解，熟悉Spring,ibatis等开源框架;
   熟练使用面向对象设计原则，掌握设计模式及应用场景; 熟练使用底层中间件、分布式技术(包括缓存、消息系统等)
   ，并对原理有一定的了解; ）

### 被提问过的技术内容总结

> **`Java语言基础`**，各种数据结构(Linklist, ArrayList, HashMap, TreeMap etc) 。其中，hashmap是提问频率最高的，几乎一定会被问到：

- Hashmap是基于什么数据结构实现的「数组+链表」
- Hashmap和hashtable的区别是什么「多线程问题，concurrenthashmap」
- Hashmap默认大小是多少？什么时候会resize？

----------------

> **`多线程相关`**
>
。主要掌握Executor创建线程池时的各种参数，各种BlockingQueue的区别以及适用场景。参考链接：http://www.infoq.com/cn/articles/java-threadPool

----------------

> **`SQL优化`**主要会问一些跟索引相关的内容：

- 聚集索引&非聚集索引：http://www.cnblogs.com/AK2012/archive/2013/01/04/2844283.html
- 索引实战，索引设计问题e：
  http://blog.csdn.net/gprime/article/details/1687930

----------------

> **`JVM相关`**(JVM内存模型;ClassLoder机制;GC场景+机制;JVM编译优化)

- 参考书：《深入理解Java虚拟机 》
- java类加载器参考链接：https://www.ibm.com/developerworks/cn/java/j-lo-classloader/
- GC参考链接：http://blog.csdn.net/z69183787/article/details/51131629

----------------

> **`各种中间件`**
>1. **`RPC服务框架`**（同步阻塞/同步非阻塞/异步非阻塞；BIO；NIO；NIO的4种调用方式、实现方式selector）

- 点评pigeon资料：http://ppt.geekbang.org/slide/show/424
- 主流框架结构：https://wiki.sankuai.com/pages/viewpage.action?pageId=725008629
- 序列化的方式（PB、Hession、thrift、java serializable序列化对象大小，序列化，反序列化时间的比较）
- Netty是怎么实现RPC的

> 2. **`消息中间件`**：Swallow kafka

- 如何实现系统解耦；
- 如何实现业务操作 和 消息发送的一致性；
- 如何解决消息中间件与使用者的强依赖问题；
- JMS消息模型

> 3. **`KV中间件squirrel`**（需要了解redis的知识）

- 缓存穿透，缓存击穿，缓存雪崩解决方案分析http://blog.csdn.net/zeb_perfect/article/details/54135506
-

点评的squirrel：https://wiki.sankuai.com/pages/viewpage.action?pageId=610280467&preview=%2F610280467%2F610280452%2FSquirrel%E6%8A%80%E6%9C%AF%E5%88%86%E4%BA%AB.pptx

- redis常见面试题`**：http://blog.csdn.net/guchuanyun111/article/details/52064870

> 4. **`zebra`**数据库中间件

- 垂直、水平拆分数据库；
- 数据库分布式事务（重点）：ACID、CAP理论、二段式提交，三段式提交一致性Hash，Paxos算法
- 数据层访问的流程
- ORM框架之间的比较

> 5. **`提问低频的一些中间件`**：监控平台CAT、HTTP层 SLB、HLB、统一任务调度平台Crane
     （需要稍作了解，比如cat监控平台有哪些参数，分别是什么作用；比如CAT是如何实现服务调用链路的监控，阿里是在接口上打注解，用AOP实现的）

----------------

> **`Spring相关`**：

1. **`AOP实现原理`**（JDK动态代理）
   延伸：JDK动态代理是怎么实现的？（反射http:
   //rejoy.iteye.com/blog/1627405）、JDK动态代理跟CGlib有什么区别（JDK动态代理只能代理接口）、JDK动态代理跟CGlib的效率哪个比较高？为什么？
2. **`IOC原理`**

----------------

> **`无规律可循的被提问到的内容：`**

1. **`SSO登录原理`**：
   参考链接：https://wiki.sankuai.com/pages/viewpage.action?pageId=737929535
2. **`权限系统的设计原理`**
3. **`你知道哪些设计模式，有哪些是在工作中用到的？如何实现一个简单的单例、Spring多例怎么实现（@Scope注解）`**
4.
    *
*`算法题目「参考校招面试，只要基础不差就可以，不用特意准备」（如何实现一个String的字母倒转、多个String模式匹配、信号量是什么，java中是哪个包实现的、汉诺塔问题）`
**

----------------

#### 最后的面试官的提问

> ###### 1.你平时关注哪些技术网站（InfoQ、segmentfault、github…）
>###### 2.你对自己未来的职业发展有什么看法
>###### 3.你有什么问题想问我的吗
