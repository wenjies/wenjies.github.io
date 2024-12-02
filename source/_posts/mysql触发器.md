---
title: mysql触发器
excerpt: 触发器是一种与表操作有关的数据库对象，当触发器所在表上出现指定事件时，将调用该对象，即表的操作事件触发表上的触发器的执行。
date: 2016-08-14 09:00:00
categories: 数据库
tags:
  - mysql
---

## mysql触发器

- 触发器: 触发器是一种与表操作有关的数据库对象，当触发器所在表上出现指定事件时，将调用该对象，即表的操作事件触发表上的触发器的执行。

**`语法`**
> DELIMITER $$
> CREATE
> TRIGGER <TRIGGER Name> BEFORE/AFTER INSERT/UPDATE/DELETE
> ON <Table Name>
> FOR EACH ROW BEGIN
> ....;
> END$$
> DELIMITER ;

	1.	INSERT | UPDATE | DELETE --触发器有执行的时间设置：可以设置为事件发生前或后。
	2.	INSERT | UPDATE | DELETE --同样也能设定触发的事件：它们可以在执行insert、update或delete的过程中触发。
	3.	FOR EACH ROW  每行受影响，触发器都执行，叫行级触发器。

**`例子`**
> DELIMITER $$
> CREATE
> TRIGGER tir_first BEFORE DELETE ON t_user
> FOR EACH ROW BEGIN
> INSERT INTO t_user_tem(id,uid,uname) VALUES (NULL,OLD.id,OLD.name);
> END$$
> DELIMITER;

**`变量详解`**

1. DECLARE var_name[,...] type [DEFAULT value] 来定义一局部变量,只能在 BEGIN … END 复合语句中使用，并且应该定义在复合语句的开头
2. SET var_name = expr [,var_name = expr] 采用SET语句对变量赋值。
3. NEW 与 OLD和 MS SQL Server 中的 INSERTED 和 DELETED 类似，MySQL中定义了 NEW 和 OLD，用来表示触发器的所在表中，触发了触发器的那一行数据。
   在 INSERT 型触发器中，NEW 用来表示将要（BEFORE）或已经（AFTER）插入的新数据；
   在 UPDATE 型触发器中，OLD 用来表示将要或已经被修改的原数据，NEW 用来表示将要或已经修改为的新数据；
   在 DELETE 型触发器中，OLD 用来表示将要或已经被删除的原数据；
   使用方法： NEW.columnName （columnName 为相应数据表某一列名）另外，OLD 是只读的，而 NEW 则可以在触发器中使用 SET
   赋值，这样不会再次触发触发器，造成循环调用。

**`触发器的执行事物`**
InnoDB 数据库会有事务回滚：

	①如果 BEFORE 触发器执行失败，SQL 无法正确执行。
	②SQL 执行失败时，AFTER 型触发器不会触发。
	③AFTER 类型的触发器执行失败，SQL 会回滚