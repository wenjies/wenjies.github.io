---
layout: post
title: "mysql存储过程"
date: 2016-08-12 09:00:00 +0800 
categories: MySQL
tag: mysql
---
* content
{:toc}
<!-- more -->
## 存储过程简介
1.	SQL语句需要先编译然后执行，而存储过程（Stored Procedure）是一组为了完成特定功能的SQL语句集，经编译后存储在数据库中，用户通过指定存储过程的名字并给定参数（如果该存储过程带有参数）来调用执行它。
 
2.	存储过程是可编程的函数，在数据库中创建并保存，可以由SQL语句和控制结构组成。当想要在不同的应用程序或平台上执行相同的函数，或者封装特定功能时，存储过程是非常有用的。

## 存储过程的优点
1.	增强SQL语言的功能和灵活性：存储过程可以用控制语句编写，有很强的灵活性，可以完成复杂的判断和较复杂的运算。

2.	标准组件式编程：存储过程被创建后，可以在程序中被多次调用，而不必重新编写该存储过程的SQL语句。减小程序业务的复杂性，在一定程度上降低了程序的耦合性。

3.	较快的执行速度：如果某一操作包含大量的Transaction-SQL代码或分别被多次执行，那么存储过程要比批处理的执行速度快很多。因为存储过程是预编译的。在首次运行一个存储过程时查询，优化器对其进行分析优化，并且给出最终被存储在系统表中的执行计划。而批处理的Transaction-SQL语句在每次运行时都要进行编译和优化，速度相对要慢一些。

4.	减少网络流量：针对同一个数据库对象的操作（如查询、修改），如果这一操作所涉及的Transaction-SQL语句被组织进存储过程，那么当在客户计算机上调用该存储过程时，网络中传送的只是该调用语句，从而大大减少网络流量并降低了网络负载。

5.	作为一种安全机制来充分利用：通过对执行某一存储过程的权限进行限制，能够实现对相应的数据的访问权限的限制，避免了非授权用户对数据的访问，保证了数据的安全。
不同的排序算法性质有所不同，衡量算法的效率，通常是用资源，例如`CPU`(时间)占用、内存占用、硬盘占用和网络占用。当讨论大`O`表示法时，一般考虑的是`CPU`占用。

## MySQL存储过程的
**`语法`**
> 	CREATE PROCEDURE  过程名([[IN|OUT|INOUT] 参数名 数据类型[,[IN|OUT|INOUT] 参数名 数据类型…]]) [特性 ...] 过程体
	DELIMITER $$
	CREATE
	    PROCEDURE p_in(IN parm_in INT)
	    BEGIN
		   ......;
		   ......;
	    END$$
	DELIMITER ;

**`分隔符`**
> 所以要事先用“DELIMITER $$”声明当前段分隔符，让编译器把两个"$$"之间的内容当做存储过程的代码，不会执行这些代码；“DELIMITER;”的意为把分隔符还原。BEGIN ... END之间是我们要编写的部分。MySQL默认以";"为分隔符，如果没有声明分割符，则编译器会把存储过程当成SQL语句进行处理，因此编译过程会报错。

**`参数`**
> 存储过程根据需要可能会有输入、输出、输入输出参数，如果有多个参数用","分割开。MySQL存储过程的参数用在存储过程的定义，共有三种参数类型,IN,OUT,INOUT:
- IN参数的值必须在调用存储过程时指定，在存储过程中修改该参数的值不能被返回，为默认值
- OUT:该值可在存储过程内部被改变，并可返回
- INOUT:调用时指定，并且可被改变和返回

**`过程体`**
> 过程体的开始与结束使用BEGIN与END进行标识。

**`IN参数例子`**

> 	DELIMITER $$
	CREATE
	    PROCEDURE p_in(IN parm_in INT)
	    BEGIN
			SELECT parm_in;#若注掉 结果：5
		    SET parm_in=5;
		    SELECT parm_in;
	    END$$
	DELIMITER ;
调用
SET @p_in=1;
CALL p_in(@p_in);
SELECT @p_in;
结果：5
 
**`OUT参数例子`**
> 	DELIMITER $$
	CREATE
	    PROCEDURE p_out(IN parm_out INT)
	    BEGIN
	    SELECT parm_out;#若注掉 结果：5
	    SET parm_out=5;
	    SELECT parm_out;
	    END$$
	DELIMITER ;
调用
SET @p_out=1;
CALL p_out(@p_out);
SELECT @p_out;
结果：1

**`INOUT参数例子`**
	
>	DELIMITER $$
	CREATE
	    PROCEDURE p_in_out(IN parm_in_out INT)
	    BEGIN
	    SELECT parm_in_out;	#若注掉 结果：5
	    SET parm_in_out=5;
	    SELECT parm_in_out;
	    END$$
	DELIMITER ;
调用
SET @p_in_out=1;
CALL p_in_out(@p_in_out);
SELECT @p_in_out;
结果：1

**`动态拼接sql例子`**
>	DELIMITER $$
	DROP PROCEDURE IF EXISTS dsql $$
	CREATE PROCEDURE dsql(IN parameter INT,IN name1 VARCHAR(64))
	  BEGIN
	    SET @sql1='SELECT * FROM  t_user u WHERE 1=1';
	    IF parameter IS NOT NULL THEN
	      SET @sql1= CONCAT(@sql1,' and u.id = ',parameter);
	    END IF ;
	    IF (name1 IS NOT NULL AND name1!='') THEN
	      SET @sql1= CONCAT(@sql1,' and u.name LIKE\'%',name1,'%\'');
	    END IF ;
	    PREPARE stmt FROM @sql1;
	    EXECUTE stmt;
	  END$$
	DELIMITER ;

## 存储程序中的变量
1.	DECLARE局部变量 DECLARE var_name[,...] type [DEFAULT value]<br>
这个语句被用来声明局部变量。 要给变量提供一个默认值，请包含一个DEFAULT子句。值可以被指定为一个表达式，不需要为一个常数。如果没有DEFAULT子句，初始值为NULL。 局部变量的作用范围在它被声明的BEGIN ... END块内。它可以被用在嵌套的块中，除了那些用相同名字声明变量的块。
2.	变量SET语句 SET var_name = expr [, var_name = expr]<br>
在存储程序中的SET语句是一般SET语句的扩展版本。被参考变量可能是子程序内声明的变量，或者是全局服务器变量。 在存储程序中的SET语句作为预先存在的SET语法的一部分来实现。这允许SET a=x, b=y, ...这样的扩展语法。其中不同的变量类型（局域声明变量及全局和集体变量）可以被混合起来。这也允许把局部变量和一些只对系统变量有意义的选项合并起来。
3.	SELECT ... INTO<br>
SELECT col_name[,...] INTO var_name[,...] table_expr这个SELECT语法把选定的列直接存储到变量。因此，只有单一的行可以被取回。 SELECT id,data INTO x,y FROM test.t1 LIMIT 1;

列子：

	SELECT 'Hello World' INTO @a;
	SELECT @a;
	
	SET @b='Hello World';
	SELECT @b;
	
	SET @c=1+2+3;
	SELECT @c; 
	
	#在存储过程中使用用户变量
	CREATE PROCEDURE sayHi() SELECT CONCAT(@hi,'...');
	SET @hi='hi';
	CALL sayHi(); 
	#在存储过程间传递全局范围的用户变量
	CREATE PROCEDURE tp1() SET @param='p1';
	CREATE PROCEDURE tp2() SELECT CONCAT('param... ',@param);
	CALL tp1();
	CALL tp2(); 
 
## MySQL存储过程的调用
	用call和你过程名以及一个括号，括号里面根据需要，加入参数，参数包括输入参数、输出参数、输入输出参数。

## MySQL存储过程的查询
	SELECT name FROM mysql.proc WHERE db='数据库名';
	SELECT routine_name FROM information_schema.routines WHERE routine_schema='数据库名';
	SHOW PROCEDURE STATUS WHERE db='数据库名';
	 
## MySQL存储过程的删除
	DROP PROCEDURE [过程1[,过程2…]]
	从MySQL的表格中删除一个或多个存储过程。

## MySQL存储过程的控制语句
1.	变量作用域: 内部变量在其作用域范围内享有更高的优先权，当执行到end时，内部变量消失，不再可见了，在存储 过程外再也找不到这个内部变量，但是可以通过out参数或者将其值指派给会话变量来保存其值。

>	DELIMITER $$
	DROP PROCEDURE IF EXISTS `proc`$$
	  CREATE PROCEDURE proc()
	    BEGIN
	      DECLARE x1 VARCHAR(5) DEFAULT 'outer';
	        BEGIN
	          DECLARE x1 VARCHAR(5) DEFAULT 'inner';
	          SELECT x1;
	        END;
	      SELECT x1;
	    END$$
	DELIMITER ;
#调用
CALL proc(); 
结果：inner

2.	条件语句 IF-THEN-ELSE

>	DROP PROCEDURE IF EXISTS proc3 ;
	DELIMITER $$
	CREATE PROCEDURE proc3(IN parameter INT)
	  BEGIN
	    DECLARE var INT;
	    SET var=parameter+1;
	    IF var=0 THEN
	      INSERT INTO t VALUES (17);
	    END IF ;
	    IF parameter=0 THEN
	      UPDATE t SET s1=s1+1;
	    ELSE
	      UPDATE t SET s1=s1+2;
	    END IF ;
	  END$$
	DELIMITER ;

3.	CASE-WHEN-THEN-ELSE语句

>	DELIMITER $$
	  CREATE PROCEDURE proc4 (IN parameter INT)
	    BEGIN
	      DECLARE var INT;
	      SET var=parameter+1;
	      CASE var
	        WHEN 0 THEN
	          INSERT INTO t VALUES (17);
	        WHEN 1 THEN
	          INSERT INTO t VALUES (18);
	        ELSE
	          INSERT INTO t VALUES (19);
	      END CASE ;
	    END$$
	DELIMITER;
 
4.	循环语句 WHILE-DO…END-WHILE

>	DELIMITER $$
	  CREATE PROCEDURE proc5()
	    BEGIN
	      DECLARE var INT;
	      SET var=0;
	      WHILE var<6 DO
	        INSERT INTO t VALUES (var);
	        SET var=var+1;
	      END WHILE ;
	    END$$
	DELIMITER;
 
5.	REPEAT...END REPEAT 此语句的特点是执行操作后检查结果

>	DELIMITER $$
	  CREATE PROCEDURE proc6 ()
	    BEGIN
	      DECLARE v INT;
	      SET v=0;
	      REPEAT
	        INSERT INTO t VALUES(v);
	        SET v=v+1;
	        UNTIL v>=5
	      END REPEAT;
	    END$$
	DELIMITER ;
 
6.	LOOP...END LOOP

>	DELIMITER $$
	  CREATE PROCEDURE proc7 ()
	    BEGIN
	      DECLARE v INT;
	      SET v=0;
	      LOOP_LABLE:LOOP
	        INSERT INTO t VALUES(v);
	        SET v=v+1;
	        IF v >=5 THEN
	          LEAVE LOOP_LABLE;
	        END IF;
	      END LOOP;
	    END$$
	DELIMITER ;
 
7.	LABLES标号:标号可以用在begin repeat while 或者loop 语句前，语句标号只能在合法的语句前面使用。可以跳出循环，使运行指令达到复合语句的最后一步。

8.	ITERATE迭代通过引用复合语句的标号,来从新开始复合语句

>	DELIMITER $$
	  CREATE PROCEDURE proc8()
	  BEGIN
	    DECLARE v INT;
	    SET v=0;
	    LOOP_LABLE:LOOP
	      IF v=3 THEN
	        SET v=v+1;
	        ITERATE LOOP_LABLE;
	      END IF;
	      INSERT INTO t VALUES(v);
	      SET v=v+1;
	      IF v>=5 THEN
	        LEAVE LOOP_LABLE;
	      END IF;
	    END LOOP;
	  END$$
	DELIMITER ;
 
## MySQL存储过程的基本函数
1.	字符串类
	>	CHARSET(str) //返回字串字符集
		CONCAT (string2 [,... ]) //连接字串
		INSTR (string ,substring ) //返回substring首次在string中出现的位置,不存在返回0
		LCASE (string2 ) //转换成小写
		LEFT (string2 ,length ) //从string2中的左边起取length个字符
		LENGTH (string ) //string长度
		LOAD_FILE (file_name ) //从文件读取内容
		LOCATE (substring , string [,start_position ] ) 同INSTR,但可指定开始位置
		LPAD (string2 ,length ,pad ) //重复用pad加在string开头,直到字串长度为length
		LTRIM (string2 ) //去除前端空格
		REPEAT (string2 ,count ) //重复count次
		REPLACE (str ,search_str ,replace_str ) //在str中用replace_str替换search_str
		RPAD (string2 ,length ,pad) //在str后用pad补充,直到长度为length
		RTRIM (string2 ) //去除后端空格
		STRCMP (string1 ,string2 ) //逐字符比较两字串大小,
		SUBSTRING (str , position [,length ]) //从str的position开始,取length个字符,
		TRIM([[BOTH|LEADING|TRAILING] [padding] FROM]string2) //去除指定位置的指定字符
		UCASE (string2 ) //转换成大写
		RIGHT(string2,length) //取string2最后length个字符
		SPACE(count) //生成count个空格
		注：mysql中处理字符串时，默认第一个字符下标为1，即参数position必须大于等于1
2.	数学类
	>	ABS (number2 ) //绝对值
		BIN (decimal_number ) //十进制转二进制
		CEILING (number2 ) //向上取整
		CONV(number2,from_base,to_base) //进制转换
		FLOOR (number2 ) //向下取整
		FORMAT (number,decimal_places ) //保留小数位数
		HEX (DecimalNumber ) //转十六进制
		注：HEX()中可传入字符串，则返回其ASC-11码，如HEX('DEF')返回4142143
		也可以传入十进制整数，返回其十六进制编码，如HEX(25)返回19
		LEAST (number , number2 [,..]) //求最小值
		MOD (numerator ,denominator ) //求余
		POWER (number ,power ) //求指数
		RAND([seed]) //随机数
		ROUND (number [,decimals ]) //四舍五入,decimals为小数位数] 注：返回类型并非均为整数，如：
		SIGN (number2 ) // 正数返回1，负数返回-1
	 
3.	日期时间类
	>	ADDTIME (date2 ,time_interval ) //将time_interval加到date2
		CONVERT_TZ (datetime2 ,fromTZ ,toTZ ) //转换时区
		CURRENT_DATE ( ) //当前日期
		CURRENT_TIME ( ) //当前时间
		CURRENT_TIMESTAMP ( ) //当前时间戳
		DATE (datetime ) //返回datetime的日期部分
		DATE_ADD (date2 , INTERVAL d_value d_type ) //在date2中加上日期或时间
		DATE_FORMAT (datetime ,FormatCodes ) //使用formatcodes格式显示datetime
		DATE_SUB (date2 , INTERVAL d_value d_type ) //在date2上减去一个时间
		DATEDIFF (date1 ,date2 ) //两个日期差
		DAY (date ) //返回日期的天
		DAYNAME (date ) //英文星期
		DAYOFWEEK (date ) //星期(1-7) ,1为星期天
		DAYOFYEAR (date ) //一年中的第几天
		EXTRACT (interval_name FROM date ) //从date中提取日期的指定部分
		MAKEDATE (year ,day ) //给出年及年中的第几天,生成日期串
		MAKETIME (hour ,minute ,second ) //生成时间串
		MONTHNAME (date ) //英文月份名
		NOW ( ) //当前时间
		SEC_TO_TIME (seconds ) //秒数转成时间
		STR_TO_DATE (string ,format ) //字串转成时间,以format格式显示
		TIMEDIFF (datetime1 ,datetime2 ) //两个时间差
		TIME_TO_SEC (time ) //时间转秒数]
		WEEK (date_time [,start_of_week ]) //第几周
		YEAR (datetime ) //年份
		DAYOFMONTH(datetime) //月的第几天
		HOUR(datetime) //小时
		LAST_DAY(date) //date的月的最后日期
		MICROSECOND(datetime) //微秒
		MONTH(datetime) //月
		MINUTE(datetime) //分返回符号,正负或0
		SQRT(number2) //开平方

<!--http://www.cnblogs.com/mark-chan/p/5384139.html-->

## 注释
	单行：--或 #
	多行：/*  */ 

## mybatis调用存储过程

	<select id="proFindUser" resultMap="BaseResultMap" statementType="CALLABLE">
		{
			CALL find_user(#{uid,mode=IN,jdbcType=BIGINT},#{name,mode=IN,jdbcType=VARCHAR})
		}
	</select>