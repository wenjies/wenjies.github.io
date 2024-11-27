---
title: "spring单元测试"
date: 2017-10-17 09:00:00
categories: Spring
tags:
  - 单元测试
---

## spring 单元测试

    package com.demo.test;
	import org.junit.Test;
	import org.junit.runner.RunWith;
	import org.springframework.test.context.ContextConfiguration;
	import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
	
	@RunWith(SpringJUnit4ClassRunner.class)
	@ContextConfiguration("classpath:spring-mybatis.xml")
	public class TestService {
		@Test
		public void testproFindUser() {
			System.out.println();
		}
	
	}

	public static void main(String[] args) {
		ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("classpath:spring-mybatis.xml");
		context.start();
	}
