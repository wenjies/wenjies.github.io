---
layout: post
title: "MySQL的sql优化"
date: 2016-08-20 09:00:00 +0800 
categories: MySQL
tag: mysql
---
* content
{:toc}

<!-- more -->

## 单值索引和复合索引的区别
1.	首先来看没有索引的情况：可以看出 type 为 all 是全表扫描性能不高，优化就是简历索引。
>	EXPLAIN SELECT address,`name` FROM t_user u WHERE  u.address='成都' AND u.name='haha'

	![](/img/msql/y_h_1.jpg)

----------

2.	来看创建两个单值索引的情况：看到possible_keys为 idx_a,idx_n 但是key为idx_a说明只用了一个索引另一个索引没有使用（mysql会自动使用最优的索引）
>	CREATE INDEX idx_a ON t_user(address);
	CREATE INDEX idx_n ON t_user(`name`);
	EXPLAIN SELECT address,`name` FROM t_user u WHERE  u.address='成都' AND u.name='haha'

	![](/img/msql/y_h_2.jpg)

----------
3.	来看创建一个复合索引的情况：key为idx_a_n说明只用了索引,ref为 const,const 说名这个复合索引对这两个字段都起作用。Extra中有Using index（覆盖索引）sql性能很好。
>	CREATE INDEX idx_a_n ON t_user(address,`name`);
	EXPLAIN SELECT address,`name` FROM t_user u WHERE  u.address='成都' AND u.name='haha'

	![](/img/msql/y_h_3.jpg)
 
----------

## join连接索引优化
1.	left join使用索引，索引应建立在右边。 
>	分析“FROM t_user u LEFT JOIN t_user_role ur ON  u.id=ur.user_id  LEFT JOIN t_role r ON ur.role_id =r.id”索引该如何建立.
	1、“t_user u LEFT JOIN t_user_role” 所以“u.id=ur.user_id”中user_id应建索引
	2、“LEFT JOIN t_role”所以“ur.role_id =r.id”中id应建索引。因为id为主键所以本身就是主键索引。

	![](/img/msql/y_h_5.jpg)
 
----------
2.	RIGHT join使用索引，索引应建立在左边。 
>	同理分析“FROM t_user u RIGHT JOIN t_user_role ur ON  u.id=ur.user_id  RIGHT JOIN t_role r ON ur.role_id =r.id”索引该如何建立.
	1、“RIGHT JOIN t_user_role ur” 所以“ u.id=ur.user_id”中id应建索引，因为id为主键所以本身就是主键索引。
	2、“RIGHT JOIN t_role r”所以“ur.role_id =r.id”中role_id应建索引。

	![](/img/msql/y_h_6.jpg)
 
----------


## 索引失效
**`索引失效的大致情况如下`**
![](/img/msql/index_lose.png)
1、如index(a,b,c)=> whereb=5 and c=6 b,c不会使用索引.因为缺少a。<br/>
3、如index(a,b,c)=> where a=1 and b>5 and c=6 那么a,b会用到索引，c不会使用索引.<br/>
7、可以使用覆盖索引的方式解决：like'%..%'索引失效。<br/>
9、可以使用 union 带替代 or<br/>

## 小表驱动大表
----------

## in和exists
----------