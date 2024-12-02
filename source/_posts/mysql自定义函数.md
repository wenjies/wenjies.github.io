---
title: mysql自定义函数
excerpt: 自定义函数 (user-defined function UDF)就是用一个象ABS() 或 CONCAT() 这样的固有（内建）函数一样作用的新函数去扩展MySQL。所以UDF是对MySQL功能的一个扩展
date: 2016-08-11 09:00:00
categories: 数据库
tags:
  - mysql
---

## 自定义函数

- 自定义函数:  自定义函数 (user-defined function UDF)就是用一个象ABS() 或 CONCAT() 这样的固有（内建）函数一样作用的新函数去扩展MySQL。所以UDF是对MySQL功能的一个扩展

**`语法`**
> DELIMITER $$
> CREATE
> FUNCTION FUNCTION_NAME(PARAM TYPE,[PARAM TYPE,...])
> RETURNS TYPE
> BEGIN
> ...........;
> END$$
> DELIMITER ;

----------

**`详解`**

1. FUNCTION_NAME：名字必须是当前Dateabase中唯一
2. PARAM：参数名
3. PARAM TYPE：TYPE是参数类型，如 VARCHAR
4. RETURNS TYPE：返回类型，如 VARCHAR

**`变量和控制流程`**

1. mysql的变量设置，流程控制。在**`存储过程`**、**`函数`**、**`事件`**、**`触发器`**
   中的脚本规则都是一样的，可以参考：{% post_link mysql存储过程 %}

----------

**`例子`**
> DELIMITER $$
> CREATE
> FUNCTION func(str VARCHAR(10))
> RETURNS VARCHAR(100)
> BEGIN
> RETURN CONCAT(str,', hi');
> END$$
> DELIMITER ;

----------

**`删除`**
> DROP FUNCTION FUNCTION_NAME;