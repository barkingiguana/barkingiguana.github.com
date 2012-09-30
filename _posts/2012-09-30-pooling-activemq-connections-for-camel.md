---
title: Pooling ActiveMQ connections for Camel
introduction: Pool connections between Camel to ActiveMQ to save time and resources
layout: post
author: Craig
---

In [my previous camel.xml][0] I used the following XML to set up the connection to ActiveMQ:

{% highlight xml %}
    <bean id="activemq" class="org.apache.activemq.camel.component.ActiveMQComponent" >
      <property name="connectionFactory">
	<bean class="org.apache.activemq.ActiveMQConnectionFactory">
	  <property name="brokerURL" value="vm://zuu:61613?create=false&amp;waitForStart=10000" />
	</bean>
      </property>
    </bean>
{% endhighlight %}

While this code works, each time a message is sent Camel will open a new conection to the broker. I know I'm going to be doing that a lot, and I'd prefer not to waste time opening and closing the connection every time I send a message, so I'd like to hold open a pool of connections.

By changing the `camel.xml` to look like the below I can add a pool of up to 8 connections which will be held open to the broker and returned to the pool, instead of being closed, once a message has been sent.

{% highlight xml %}
    <bean id="activemq" class="org.apache.activemq.camel.component.ActiveMQComponent" >
      <property name="connectionFactory">
	<bean id="pooledConnectionFactory" class="org.apache.activemq.pool.PooledConnectionFactory">
	  <property name="maxConnections" value="8" />
	  <property name="connectionFactory">
	    <bean class="org.apache.activemq.ActiveMQConnectionFactory">
	      <property name="brokerURL" value="vm://zuu:61613?create=false&amp;waitForStart=10000" />
	    </bean>
	  </property>
	</bean>
      </property>
    </bean>
{% endhighlight %}

[0]: /2012/09/10/a-basic-servicemix-install
