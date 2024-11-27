---
title: mybatis初步使用
date: 2017-09-15 09:00:00
categories: Mybatis
tags:
  - mybatis 
---

## mybatis映射

**`1.resultMap的形式`**

	<resultMap id="userVo" type="com.base.system.entity.UserVo">
		<id column="uId" jdbcType="BIGINT" property="uId" />
		<result column="uName" jdbcType="VARCHAR" property="uName" />
		<association property="addr" column="aId" javaType="com.base.system.entity.Addr">  
			<id property="aId" column="aId"/>  
			<result property="addr" column="addr"/>  
		</association>  
		<collection property="roleList" ofType="com.base.system.entity.RoleVo" column="rId">
			<id column="rId" property="rId" jdbcType="BIGINT" />
		    <result column="rName" property="rName" jdbcType="VARCHAR" />
		    <collection property="menuList" ofType="com.base.system.entity.MenuVo" column="mId">
		    	<id column="mId" property="mId" jdbcType="BIGINT" />
			    <result column="mName" property="mName" jdbcType="VARCHAR" />
		 	</collection>
		</collection>
	</resultMap>

	注意： column="aId"  column="rId"  column="mId" 不写也可以。
		  association、collection 都有select属性可以此时设置懒加载才有意义。

**`2.foreach常用的形式`**

	<insert id="insertbatch" >
	    insert into t_role_menu (role_id, menu_id) VALUES
	 	<foreach collection="menuIds" item="menuId" open="" close="" separator=",">  
	    	(#{roleId,jdbcType=BIGINT}, #{menuId,jdbcType=BIGINT})
		</foreach>
	</insert>
	
	<delete id="deleteRole">
	    DELETE FROM t_role_menu WHERE role_id IN 
	    <foreach collection="roleIds" item="roleId" open="(" close=")" separator=",">  
	    	#{roleId,jdbcType=BIGINT}
		</foreach>
	</delete>

**`3.调用存储过程`**

	<select id="ckm" resultMap="BaseResultMap" statementType="CALLABLE">
		{CALL ckm(#{time,mode=IN,jdbcType=INTEGER}) }
	</select>

**`4.使用注意事项`**

1. 若单个参数不为 map 需要在标签 parameterType 声明参数类型。
2. 多个参数必须使用 map 或 参数注解。

#### mybatis常用标签

###### 1、trim 去掉 指定位置的字符

    <delete>
        DELETE FROM xx WHERE
        <trim prefixOverrides="AND | OR">
            <if test="id != null" > AND xx.id = #{id} </if>
            <if test="name != null" > AND xx.name = #{name} </if>
        </trim>
    </delete>

###### 2、set 会去掉最后一个,

    <update>
          UPDATE xxx A
          <set>
              <if test="nums != null"> A.NUMS = #{nums}, </if>
              <if test="state != null"> A.STATE = #{state}, </if>
          </set>
          WHERE A.id = #{id}
          <if test="sid != null"> AND A.SID = #{sid}</if>
    </update>

###### 3、where 会去掉第一个and或or组成正确的where语句

    <select>
        SELECT * FROM xx A
        <where>
            <if test="sid != null"> AND A.ID = #{sid}</if>
            <if test="bid != null"> AND A.BID = #{bid}</if>
            <if test="state != null"> AND A.STATE = #{state}</if>
        </where>
        ORDER BY A.SORT ASC, A.AA02 DESC
    </select>

###### 4、foreach  循环遍历集合数组通常用于in ids集合、item迭代项

      <update >
        update xx set STATE = #{state} where ID in 
        <foreach item="item" index="index" collection="ids" open="(" separator="," close=")">  
    	    #{item}  
    	</foreach> 
      </update>

###### 5、choose when otherwise 相当于if.. else..

    <select>
        <choose>
            <when test="state != 1">
                SELECT * from t
            </when>
            <otherwise>
                SELECT * from t2
            </otherwise>
        </choose>
    </select>

###### 6、if  判断，true则进入

    <if test="aId != null and aId != ''">
        AND a.ID = #{aId}
    </if>
    <if test="aId=='2'.toString()">..</if> 或 <if test='aId=="2"'>..</if>
    总之 test里面的判断字符串相等时需要使用双引号"",如果使用单引号就加.toString()

###### 7、CDATA  转义块里的特殊字符

      <![CDATA[ code ]]>

###### 8、resultMap中collection连接查询结果集处理.不需要可以处理关系只要column不重复。collection中包含所有‘多’关系即可

	<resultMap type="XXX" id="parentMap">
		  <result column="NAME" property="name" />
		  <result column="TYPE" property="type" />
		  <result column="LOGINNAME" property="loginname" />
		  <collection property="xxxList" ofType="xx" >
			  <result column="TYPENAME1" property="typename1" />
			  <result column="TYPENAME2" property="typename2" />
			  <result column="TYPENAME3" property="typename3" />
		  </collection>
	</resultMap>
	]()