---
title: A Basic ServiceMix Install
layout: post
author: Craig
---

Over the past several years I've frequently used ActiveMQ and Camel as a message broker and integration platform for my applications. They handle the glue and the message deliery so I can worry about what's really interesting for me, solving business problems. Apache ServiceMix provides an OSGi container in which I can run, configure and manage Camel and ActiveMQ instances and I want to explore the other services that it can provide.

The full ServiceMix install is rather large. I don't need most of it yet, and I don't want to be running services that I don't need nor understand, so I'm going to start with a very minimal install and build from there as necessary.

At the time of writing the most recent ServiceMix release is 4.4.2 so I'll download, unpack and run that:

    $ curl -L -O http://www.mirrorservice.org/sites/ftp.apache.org/servicemix/servicemix-4/4.4.2/apache-servicemix-minimal-4.4.2.tar.gz
    $ tar -xzvf apache-servicemix-minimal-4.4.2.tar.gz
    $ cd apache-servicemix-4.4.2/
    $ ./bin/servicemix

Let's verify what's distributed in the minimal ServiceMix install, make sure there's nothing surprising:

    karaf@root> features:list --installed
    State         Version   Name            Repository  Description
    [installed  ] [2.2.4  ] karaf-framework karaf-2.2.4
    [installed  ] [2.2.4  ] config          karaf-2.2.4

Not much there, a basic Karaf install pre-configured with the ServiceMix Maven
repositories:

    karaf@root> features:listurl
     Loaded   URI
      true    mvn:org.apache.karaf.assemblies.features/standard/2.2.4/xml/features
      true    mvn:org.apache.servicemix/apache-servicemix/4.4.2/xml/features
      true    mvn:org.apache.activemq/activemq-karaf/5.5.1/xml/features
      true    mvn:org.apache.camel.karaf/apache-camel/2.8.5/xml/features
      true    mvn:org.apache.cxf.karaf/apache-cxf/2.4.6/xml/features
      true    mvn:org.apache.karaf.assemblies.features/enterprise/2.2.4/xml/features
      true    mvn:org.apache.servicemix.nmr/apache-servicemix-nmr/1.5.0/xml/features

I can build on this minimal install by adding the features I'll need. To start with I'm definitely going to need Camel and ActiveMQ since those are the basis for my integration. I'm used to configuring these using Spring so I'll use the `*-spring` variant of these packages rather than the `*-blueprint` variant more usually used by ServiceMix.

First I have to install some OSGi bundles that Camel relies on. I'm not sure yet how to configure ServiceMix so that it'll pull these in automatically - I suspect I need to add the correct feature URL but I'm not sure how to define exactly which feature URL to add. Please [get in touch][0] if you can explain.

    karaf@root> osgi:install -s mvn:org.apache.geronimo.specs/geronimo-activation_1.1_spec/1.0.2
    karaf@root> osgi:install -s mvn:org.apache.servicemix.specs/org.apache.servicemix.specs.stax-api-1.0/1.1.0
    karaf@root> osgi:install -s mvn:org.apache.servicemix.specs/org.apache.servicemix.specs.jaxb-api-2.1/1.1.0
    karaf@root> osgi:install -s mvn:org.apache.servicemix.bundles/org.apache.servicemix.bundles.jaxb-impl/2.1.6_1
    karaf@root> osgi:install -s mvn:org.apache.servicemix.bundles/org.apache.servicemix.bundles.xstream/1.3_4
    karaf@root> osgi:install -s mvn:org.apache.servicemix.bundles/org.apache.servicemix.bundles.joda-time/1.5.2_3
    karaf@root> osgi:install -s mvn:org.apache.servicemix.bundles/org.apache.servicemix.bundles.jdom/1.1_3
    karaf@root> osgi:install -s mvn:org.apache.servicemix.bundles/org.apache.servicemix.bundles.dom4j/1.6.1_3
    karaf@root> osgi:install -s mvn:org.apache.servicemix.bundles/org.apache.servicemix.bundles.xstream/1.3_4

Now I can install ActiveMQ and Camel:

    karaf@root> features:install spring
    karaf@root> features:install camel-core
    karaf@root> features:install camel-spring
    karaf@root> features:install activemq-spring

I need to make Camel able to talk to ActiveMQ so I also need the `camel-activemq` component:

    karaf@root> features:install camel-activemq

Now that everything is installed I setup the broker, telling it the name of the broker instance I want to use, `zuu` (the name of my laptop, but this can be pretty much be any name I want):

    karaf@root> activemq:create-broker --name zuu
    
    Creating file: @|green /Users/craig/code/tmp/apache-servicemix-4.4.2/deploy/zuu-broker.xml|
    
    Default ActiveMQ Broker (zuu) configuration file created at: /Users/craig/code/tmp/apache-servicemix-4.4.2/deploy/zuu-broker.xml
    Please review the configuration and modify to suite your needs.
    
    0

Happily the default configuration sets up a Stomp transport on port 61613 which I'll use in my Ruby - and other language - clients. No need to change anything in this file, although I guess I could remove the OpenWire connector running on port 61616.

Configuring Camel is a touch more complicated, I have to drop a `camel.xml` file into the `deploy/` subdirectory of my ServiceMix install:

    <beans xmlns="http://www.springframework.org/schema/beans"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="
    http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.0.xsd
    http://camel.apache.org/schema/spring http://camel.apache.org/schema/spring/camel-spring-2.8.5.xsd">

      <camelContext id="camel" xmlns="http://camel.apache.org/schema/spring">
        <route id="tick-tock">
          <from uri="timer://tick-tock-timer?fixedRate=true&amp;period=5000" />
          <to uri="log:tick-tock-log" />
          <to uri="activemq:topic:tick-tock" />
        </route>
      </camelContext>

      <bean id="activemq" class="org.apache.activemq.camel.component.ActiveMQComponent" >
        <property name="connectionFactory">
          <bean class="org.apache.activemq.ActiveMQConnectionFactory">
            <property name="brokerURL" value="vm://zuu?create=false&amp;waitForStart=10000" />
            <property name="userName" value="${activemq.username}"/>
            <property name="password" value="${activemq.password}"/>
          </bean>
        </property>
      </bean>
    </beans>

I can see that the route is running in Camel by checking the logs:

    karaf@root> log:tail
    2012-09-10 22:39:19,603 | INFO  | tick-tock-timer  | tick-tock-log      | ? ? | 54 - org.apache.camel.camel-core - 2.8.5 | Exchange[ExchangePattern:InOnly, BodyType:null, Body:[Body is null]]
    2012-09-10 22:39:19,603 | INFO  | tick-tock-timer  | TransportConnector | ? ? | 79 - org.apache.activemq.activemq-core - 5.5.1 | Connector vm://zuu Started
    2012-09-10 22:39:19,606 | INFO  | tick-tock-timer  | TransportConnector | ? ? | 79 - org.apache.activemq.activemq-core - 5.5.1 | Connector vm://zuu Stopped

I can also hook up my Ruby client to listen to the destination in the route:

    require 'rubygems'
    require 'stomp'
    
    STDOUT.sync = true
    c = Stomp::Client.new 'stomp://127.0.0.1:61613'
    c.subscribe '/topic/tick-tock' do |m|
      puts m.headers.inspect
    end
    c.join

Running that gets a steady stream of messages appearing in my console:

    $ ruby ./client.rb
    {"message-id"=>"ID:zuu.local-53690-1347226528097-2:42161:1:1:1", "breadcrumbId"=>"ID-zuu-local-54049-1347228987046-12-310", "destination"=>"/topic/tick-tock", "timestamp"=>"1347313904606", "expires"=>"0", "subscription"=>"587e9bbe3714dfd10b3cfe9837a1fb7daac2d8b2", "priority"=>"4", "firedTime"=>"Mon Sep 10 22:51:44 BST 2012"}
    {"message-id"=>"ID:zuu.local-53690-1347226528097-2:42162:1:1:1", "breadcrumbId"=>"ID-zuu-local-54049-1347228987046-12-312", "destination"=>"/topic/tick-tock", "timestamp"=>"1347313909605", "expires"=>"0", "subscription"=>"587e9bbe3714dfd10b3cfe9837a1fb7daac2d8b2", "priority"=>"4", "firedTime"=>"Mon Sep 10 22:51:49 BST 2012"}

Success! I can now play around with `zuu-broker.xml` and `camel.xml` and every time I save the files to disk, ServiceMix picks up the change and restarts the appropriate bundle.

Okay, I now have a basic ServiceMix install providing what I'm used to. Time to explore.

[0]: mailto:craig@barkingiguana.com

