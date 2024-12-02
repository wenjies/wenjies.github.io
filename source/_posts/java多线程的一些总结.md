---
title: java多线程的一些总结
excerpt: java多线程的创建方式、线程间的通信方式。
date: 2017-07-24 09:00:00
category: JAVA
tags:
  - 基础知识
---

# 1.java线程创建方式
----------------

### 创建线程

1. 继承 Thread重写 run方法,调用 start方法。
   ```
   new Thread(){
   public void run() {
   System.out.println("Thread");
   };
   }.start();
   ```
2. Thread构造函数 中传入 Runnable 实现类,调用 start方法。

```
new Thread(new Runnable() {
	@Override
	public void run() {
		System.out.println("Runnable");
	}
}).start();
```

3. 线程池中submit一个 (*Callable* ) 代码如下：

```
ExecutorService service = Executors.newSingleThreadExecutor();
Future<String> future = service.submit(new Callable<String>() {
	public String call() throws Exception {
		return "Callable";
	}
});
future.get();
```

4. 创建Timer

```
new Timer().schedule(
		new TimerTask(){
			public void run() {
				System.out.println("Timer");
			}
		}, 
10000,
1000);
```

# 2.线程间的通信方式

### 1. 线程同步synchronized、notify、wait

* 如果对象调用了wait方法就会 使持有该对象的线程把该对象的控制权交出去，然后处于等待状态。
* 如果对象调用了notify方法就会通知某个正在等待这个对象的控制权的线程可以继续运行。（但不是立即）
* 如果对象调用了notifyAll方法就会通知所有等待这个对象控制权的线程继续运行。（但不是立即）
* wait、notify必须用在synchronized块里面。
* 下面主线程和子线程轮流打印5次例子：

```
public class SynchronizedDemo {

	public static void main(String[] args) throws Exception {
		final Worker business = new Worker();
		new Thread() {
			public void run() {
				for (int i = 1; i <= 2; i++) {
					try {
						business.sub(i);
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
			};
		}.start();

		for (int i = 1; i <= 2; i++) {
			business.main(i);
		}
	}

}
 
class Worker {
	private boolean isSub = true;

	public synchronized void sub(int i) throws Exception {
		while (!isSub) {
			this.wait();
		}
		for (int j = 1; j <= 5; j++) {
			System.out.println("sub: " + i + " times " + ",  loop " + j);
		}
		isSub = false;
		this.notify();
	}

	public synchronized void main(int i) throws InterruptedException {
		while (isSub) {
			this.wait();
		}
		for (int j = 1; j <= 5; j++) {
			System.out.println("main: " + i + " times " + ",  loop " + j);
		}
		isSub = true;
		this.notify();
	}
}

```

### 2. 利用ReentrantLock、Condition

* 如果Lock调用了await()方法就会 使持有该对象的线程把该对象的控制权交出去，然后处于等待状态。
* 如果对象调用了signal方法就会通知某个正在等待这个对象的控制权的线程可以继续运行。（但不是立即）
* 如果对象调用了signalAll方法就会通知所有等待这个对象控制权的线程继续运行。（但不是立即）
* lock.unlock() 一定要写在 finally 块里防止异常释放锁失败造成死锁。
* 下面主线程和子线程轮流打印5次例子：

```
public class ReentrantLockDemo {
	public static void main(String[] args) throws Exception {
		final Worker2 business = new Worker2();
		new Thread() {
			public void run() {
				for (int i = 1; i <= 2; i++) {
					try {
						business.sub(i);
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
			};
		}.start();

		for (int i = 1; i <= 2; i++) {
			business.main(i);
		}
	}

}
  
class Worker2 {
	Lock lock = new ReentrantLock();
	Condition condition = lock.newCondition();
	private boolean isSub = true;
	public void sub(int i) throws InterruptedException {
		lock.lock();
		try {
			while (!isSub) {
				condition.await();
			}
			for (int j = 1; j <= 5; j++) {
				System.out.println("sub: " + i + " times " + ",  loop " + j);
			}
			isSub = false;
			condition.signal();
		} finally {
			lock.unlock();
		}
	}

	public void main(int i) throws InterruptedException {
		lock.lock();
		try {
			while (isSub) {
				condition.await();
			}
			for (int j = 1; j <= 5; j++) {
				System.out.println("main: " + i + " times " + ",  loop " + j);
			}
			isSub = true;
			condition.signal();
		} finally {
			lock.unlock();
		}
	}

}
```

### 3. volatile能保证所修饰的变量对于多个线程可见性，即只要被修改，其它线程读到的一定是最新的值。（并不能保证，线程并发修改的数据是安全的）

### 4. 并发工具类

* Semaphore 线程调用semaphore.acquire()获取资源使用权 当获取到资源执行，否则一直阻塞 等待获取资源Semaphore 构造函数中必须有
  最大的数量

```
public static void main(String[] args) {
	final Semaphore semaphore = new Semaphore(1);
	for (int i = 0; i < 10; i++) {
		new Thread() {
			@Override
			public void run() {
				try {
					System.out.println(Thread.currentThread().getName() + " 我申请坑位");
					semaphore.acquire(1);
					System.out.println(Thread.currentThread().getName() + " 我申请到坑位啦");
					Thread.sleep(5000);
					System.out.println(Thread.currentThread().getName() + ":  我完事啦");
					semaphore.release();
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}
		}.start();
	}

}
```

* Callable、Future 必须在线程池中使用，调用future.get()的线程会阻塞等待结果。

```
public static void main(String[] args) throws Exception {
	ExecutorService service = Executors.newSingleThreadExecutor();
	final Future<String> future = service.submit(new Callable<String>() {
		public String call() throws Exception {
			System.out.println("我在计算中");
			Thread.sleep(1000);
			return "hello";
		}
	});
	
	service.submit(new Runnable() {
		public void run() {
			try {
				System.out.println("我在等待结果中");
				System.out.println("结果: "+future.get());
			} catch (Exception e) {
				e.printStackTrace();
			} 
		}
	});
	service.shutdown();
}
```

* Exchanger仅适用与两个线程间数据的交换(类是与买东西 找补)。

```
 public static void main(String[] args) {
	final Exchanger<Integer> exchanger=new Exchanger<Integer>();
	 new Thread(){
		 @Override
		public void run() {
			 System.out.println(Thread.currentThread().getName()+ "那谁，我要给你5块");
			 try {
				Integer exchange = exchanger.exchange(5);
				System.out.println(Thread.currentThread().getName()+ "收到："+exchange +" 块 ");
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
	 }.start();
	 
	 new Thread(){
		 @Override
		public void run() {
			 System.out.println(Thread.currentThread().getName()+ "那谁，我要找你1块");
			 try {
				 Integer exchange = exchanger.exchange(1);
			     System.out.println(Thread.currentThread().getName()+ "收到："+exchange +" 块 ");
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	 }.start();
	 
	 
}
 ```

* CyclicBarrier 用于多个线程都准备等待,当同时等待的线程达到规定数量后 所有线程自动唤醒运行。 （类似汽车票站
  没有检够票数不发车）相比CountDownLatch,CyclicBarrier不需要其他线程来唤醒等待的线程.CyclicBarrier 的构造函数 等待线程数量
  达到规定数量线程开始运行。

```
public static void main(String[] args) {
	CyclicBarrier cyclicBarrier=new CyclicBarrier(5);
	for(int i=0;i<5;i++) {
		 new Thread(){
			 @Override
			public void run() {
				 try {
					 cyclicBarrier.await();
					Thread.sleep((long) (Math.random()*1000));
					System.out.println(Thread.currentThread().getName()+ ":  开始跑啦");
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		 }.start();;
	 }
}
```

* CountDownLatch 用于多个线程都准备等待，接到命令后 统一运行（类似 赛跑比赛）CountDownLatch的构造函数中的数字表示等待者必须接到几次命令后
  开始运行等待者待用调用countDownLatch.await()后开始阻塞发布命令者调用一次或多次countDownLatch.countDown()后唤醒等待者。

```
public static void main(String[] args) throws Exception {
	 final CountDownLatch countDownLatch=new CountDownLatch(1);
	 for(int i=0;i<3;i++) {
		 new Thread(){
			 @Override
			public void run() {
				 try {
					countDownLatch.await();
					Thread.sleep((long) (Math.random()*1000));
					System.out.println(Thread.currentThread().getName()+ ":  开始跑啦");
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}
		 }.start();
	 }
	 
	 Thread.sleep(2000);
	 System.out.println(Thread.currentThread().getName()+ ":  准备");
	 countDownLatch.countDown();
}

```

# 3.线程常用api

1. join()：线程的合并的含义就是将几个并行线程的线程合并为一个单线程执行，应用场景是当一个线程必须等待另一个线程执行完毕才能执行时可以使用join方法。
2. yield(): 暂停当前正在执行的线程对象，并执行其他线程。（当前时间片）。
3. interrupt():中断线程。
4. sleep(long millis)：暂停执行(不会释放占有资源)。

# 4.线程池

### ThreadPoolExecutor

	1.ThreadPoolExecutor：ThreadPoolExecutor(int corePoolSize,int maximumPoolSize,long keepAliveTime,TimeUnit unit,BlockingQueue<Runnable> workQueue)
		1.	当线程池实际线程数小于corePoolSize时，有新的任务加入则优先创建线程。
		2.	当线程池实际线程数等于corePoolSize时，有新的任务加入则加入队列。
		3.	当线程池实际线程数等于corePoolSize时，有新的任务加入若队列已满，则在总线程数不大于maximumPoolSize的前提下，创建新的线程。
		4.	当线程池实际线程数等于maximumPoolSize，有新的任务加入则执行拒绝策略（默认抛异常）。可自定义拒绝策略 需实现RejectedExecutionHandler接口。
		总结：所以关键点是： 队列是否会满若是无限队列（可能系统资源耗尽） ,maximumPoolSize是否会达到最大值。

	2.Executors工具提供四种线程池(基于 ThreadPoolExecutor )，分别为：
		1.	newCachedThreadPool创建一个可缓存线程池，如果线程池长度超过处理需要，可灵活回收空闲线程，若无可回收，则新建线程。
		2.	newFixedThreadPool 创建一个定长线程池，可控制线程最大并发数，超出的线程会在队列中等待。
		3.	newScheduledThreadPool 创建一个定长线程池，支持定时及周期性任务执行。
		4.	newSingleThreadExecutor 创建一个单线程化的线程池，它只会用唯一的工作线程来执行任务，保证所有任务按照指定顺序(FIFO, LIFO, 优先级)执行。

# 5.Java死锁范例以及如何分析死锁

### 什么是死锁

	1.死锁是这样一种情形：多个线程同时被阻塞，它们中的一个或者全部都在等待某个资源被释放,而那个资源又不能被释放。导致线程被无限期地阻塞，因此程序不可能正常终止。(等待一个永远无法获取的资源)
	2.java 死锁产生的四个必要条件：
		1、互斥使用，即当资源被一个线程使用(占有)时，别的线程不能使用
		2、不可抢占，资源请求者不能强制从资源占有者手中夺取资源，资源只能由资源占有者主动释放。
		3、请求和保持，即当资源请求者在请求其他的资源的同时保持对原有资源的占有。
		4、循环等待，即存在一个等待队列：P1占有P2的资源，P2占有P3的资源，P3占有P1的资源。这样就形成了一个等待环路。

### 死锁方式

1.

第一种synchronized方式死锁：线程thread1先获取锁locka，然后在同步块里嵌套竞争锁lockb。而线程thread2先获取锁lockb，然后在同步块里嵌套竞争锁locka。此时已经被线程thread1拥有，而thread1在等待lockb，而lockb被thread2拥有，thread2在等待locka……无线循环。(
synchronized (locka){ ...; synchronized (locka){...;} ....; } )

2. 第二种concurrent包Lock错误使用，导致死锁：释放锁使用地方不规范，导致死锁不能正常释放！ 应该在finally块里 lock.unlock();

### 解决方法

1. 修改代码才能从根本解决问题。
2. 检查问题代码
    1. 使用一些静态分析库可以帮助我们发现可能出现的死锁。
    2. 它其中包含连个方法findDeadlockedThreads()和findMonitorDeadlockedThreads()，用来查找处于死锁。代码如下：thread1
       和thread2 死锁状态。

```
public static void main(String[] args) {
	final Object lock1 = new Object();
	final Object lock2 = new Object();

	Thread thread1 = new Thread(new Runnable() {
		@Override
		public void run() {
			synchronized (lock1) {
				System.out.println("Thread1 acquired lock1");
				try {
					TimeUnit.MILLISECONDS.sleep(500);
				} catch (InterruptedException ignore) {
				}
				synchronized (lock2) {
					System.out.println("Thread1 acquired lock2");
				}
			}
		}

	});
	thread1.start();

	Thread thread2 = new Thread(new Runnable() {
		@Override
		public void run() {
			synchronized (lock2) {
				System.out.println("Thread2 acquired lock2");
				synchronized (lock1) {
					System.out.println("Thread2 acquired lock1");
				}
			}
		}
	});
	thread2.start();
	try {
		Thread.sleep(20000);
	} catch (InterruptedException e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
	Thread thread3 = new Thread(new Runnable() {
		@Override
		public void run() {
			ThreadMXBean mbean = ManagementFactory.getThreadMXBean();
			long[] findDeadlockedThreads = mbean.findDeadlockedThreads();
			if (findDeadlockedThreads != null) {
				ThreadInfo[] threadInfos = mbean.getThreadInfo(findDeadlockedThreads);
				for (ThreadInfo threadInfo : threadInfos) {
					//获取线程
					for (Thread thread : Thread.getAllStackTraces().keySet()) {
						if (thread.getId() == threadInfo.getThreadId()) {
							System.err.println(threadInfo.toString().trim());
							for (StackTraceElement ste : thread.getStackTrace()) {
								System.err.println("t" + ste.toString().trim());
							}
						}
					}
					
				}
			}
		}
	});
	thread3.start();
}

```