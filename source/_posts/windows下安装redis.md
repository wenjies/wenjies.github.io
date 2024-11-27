---
title: "windows下安装redis"
date: 2016-11-16 09:00:00
categories: Redis
tags:
  - redis
---
 
# windows 下安装redis步骤：

##### 1.点击 <a href="https://github.com/MicrosoftArchive/redis/releases">redis</a> 选择zip版本，下载并解压

##### 2.修改配置

1. maxheap 在 redis.windows.conf 找到 # maxheap <bytes> maxheap 1024000000（这是设置最大数据堆的大小）
2. requirepass redis.windows.conf 搜索# requirepass foobared 修改密码,去掉‘#’
3. port 修改端口 redis.windows.conf 搜索port 6379

##### 3.运行

    redis-server.exe redis.windows.conf

##### 4.安装成windows服务

    redis-server --service-install redis.windows.conf --loglevel verbose  --service-name Redis  注册为服务（要以管理员权限运行 cmd）

##### 5.图形化工具 <a href="https://redisdesktop.com/download">下载</a>

    
     