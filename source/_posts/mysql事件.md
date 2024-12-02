---
title: mysql事件
excerpt: 事件（event）是MySQL在相应的时刻调用的过程式数据库对象。一个事件可调用一次，也可周期性的启动，它由一个特定的线程来管理的，也就是所谓的“事件调度器”。事件可以取代定时任务来执行的工作。
date: 2016-08-15 09:00:00
categories: 数据库
tags:
  - mysql
---

## mysql事件

- 事件:  事件（event）是MySQL在相应的时刻调用的过程式数据库对象。一个事件可调用一次，也可周期性的启动，它由一个特定的线程来管理的，也就是所谓的“事件调度器”。
  事件可以取代定时任务来执行的工作。

## 事件的优缺点

- 优点：
  一些对数据定时性操作不再依赖外部程序，而直接使用数据库本身提供的功能。
  可以实现每秒钟执行一个任务，这在一些对实时性要求较高的环境下就非常实用了。
- 缺点：
  定时触发，不可以调用。

**`语法`**
> DELIMITER $$
> CREATE EVENT EVENT_NAME
> ON SCHEDULE EVENT_SCHEDULE
[ON COMPLETION [NOT] PRESERVE]
[ENABLE | DISABLE]
> DO
> BEGIN
> ....;   
> END$$
> DELIMITER ;

**`详解`**

1. EVENT_NAME：名称最大长度可以是64个字节。名字必须是当前Dateabase中唯一 建议规则：动作名称_（INTO/FROM_）表名_TIME
2. EVENT_SCHEDULE：有两种设定计划任务的方式
    1. AT 时间戳，用来完成单次的计划任务。
    2. EVERY 时间（单位）的数量时间单位[STARTS 时间戳] [ENDS时间戳]，用来完成重复的计划任 YEAR，MONTH，DAY，HOUR，MINUTE
       或者SECOND。
3. ON COMPLETION [NOT] PRESERVE ：PRESERVE 当event到期了,event会被disable,但是该event还是会存在,而not
   preserve该event会被自动删除掉.
4. ENABLE\DISABLE参数Enable和Disable表示设定事件的状态。Enable表示系统将执行这个事件。Disable表示系统不执行该事件。
5. BEGIN....END 中可以调用存储过程。

**`例子`**
> DELIMITER $$
> CREATE EVENT event_first
> ON SCHEDULE AT '2017-09-05 19:00:57'
> ON COMPLETION NOT PRESERVE
> ENABLE
> DO
> BEGIN
> INSERT INTO t_user_tem(id,uid,uname,`time`) VALUES (NULL,1,NULL,NOW());
> END$$
> DELIMITER ;


> DELIMITER $$
> CREATE EVENT event_first2
> ON SCHEDULE every 1 minute
> ON COMPLETION NOT PRESERVE
> ENABLE
> DO
> BEGIN
> INSERT INTO t_user_tem(id,uid,uname,`time`) VALUES (NULL,1,NULL,NOW());
> END$$
> DELIMITER ;


> DELIMITER $$
> CREATE EVENT event_first2
> ON SCHEDULE every 30 SECOND STARTS '2017-09-05 19:00:00' ENDS '2017-09-05 19:10:00'
> ON COMPLETION NOT PRESERVE
> ENABLE
> DO
> BEGIN
> INSERT INTO t_user_tem(id,uid,uname,`time`) VALUES (NULL,1,NULL,NOW());
> END$$
> DELIMITER ;