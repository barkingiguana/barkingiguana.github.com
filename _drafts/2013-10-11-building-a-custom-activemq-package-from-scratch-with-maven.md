---
title: Building A Custom Camel Package From Scratch With Maven
layout: post
author: Craig
---

## A basic project with Maven

Initialise the project using Maven (this will download the default Maven plugins if it's the first time you've used Maven):

    $ mvn archetype:create -DgroupId=com.barkingiguana.blog.activemq -DartifactId=example1 -DpackageName=com.barkingiguana.blog.activemq -Dversion=0.0.1

Move into the project directory, named after the artifactId:

    $ cd example1

Make sure the project builds and the tests pass (this will download a bunch of dependencies):

    $ mvn install

If it succeeds you'll end up with a JAR built in `target/example1-0.0.1.jar` - `example1` from the `artifactId` parameter and `0.0.1` from the `version` parameter.

You can satisfy yourself that it runs be executing it using `java` on the command line:

    $ java -cp target/example1-0.0.1.jar com.barkingiguana.blog.activemq.App
    Hello World!

## Adding Some Camel

Under the `<dependencies>` section on the `pom.xml` add the following XML snippet which expresses a dependency on the Camel Core component. Ths will provide us with basic Camel functionality.

{% highlight xml %}
<dependency>
  <groupId>org.apache.camel</groupId>
  <artifactId>camel-core</artifactId>
  <version>2.12.1</version>
</dependency>
{% endhighlight %}

We'll also express a dependency on `camel-testng` which allows us to specify automated tests for our Camel install:

{% highlight xml %}
<dependency>
  <groupId>org.apache.camel</groupId>
  <artifactId>camel-testng</artifactId>
  <version>2.12.1<version>
  <scope>test</scope>
</dependency>
{% endhighlight %}

Now run `mvn install` again, to pull in the dependencies, build and package the whole project. Great, we now have Camel available to play with. It's a bit annoying to have to specify the class to run at the command line though, surely there's a better way?

### Running Camel with Maven

iWe can avoid the packaging to JAR step completely by adding the Maven build plugin for Camel to our POM. Within the `<project>` tag, add a build plugins section that looks like this:

{% highlight xml %}
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.camel</groupId>
      <artifactId>camel-maven-plugin</artifactId>
      <version>2.12.1</version>
      <configuration>
        <mainClass>com.barkingiguana.blog.activemq.App</mainClass>
      </configuration>
    </plugin>
  </plugins>
</build>
{% endhighlight %}

Make sure the `mainClass` points to the main class of your application. Now instead of running `mvn install && java -cp target/example1-0.0.1.jar com.barkingiguana.blog.activemq.App` we can simply run:

    $ mvn camel:run

Easy!

Except... It's still the "Hello, World" output. We're not actually running anything to do with Camel yet. Hmm.

### Test Driven Camel

I really enjoy test driven design, so before I run anything Camel related I want to write the tests to ensure that my implementation does what I want it to do.

I've already pulled in `camel-testng` as a dependency so let's use that. I've added an example test in `src/test/java/com/barkingiguana/blog/activemq/ExampleTest.java`:

{% highlight java %}
package com.barkingiguana.blog.activemq;

import org.apache.camel.CamelContext;
import org.apache.camel.ProducerTemplate;
import org.apache.camel.Produce;
import org.apache.camel.EndpointInject;
import org.apache.camel.testng.CamelTestSupport;
import org.apache.camel.component.mock.MockEndpoint;
import org.apache.camel.component.properties.PropertiesComponent;
import org.apache.camel.builder.RouteBuilder;
import org.testng.annotations.Test;

public class ExampleTest
  extends CamelTestSupport {

  // My route will start with a call to the endpoint at direct:start
  // so let's attach a producer which we cna control to that.
  @Produce(uri = "direct:start")
  protected ProducerTemplate template;

  // I'll make the results go to a mock endpoint that I can set
  // expectations on so I can show that my route does what I want it to
  // do. I'm actually intending that the real route will end up logging
  // the results, but I need to check that it received the correct
  // message to know it worked.
  @EndpointInject(uri = "mock:result")
  protected MockEndpoint resultEndpoint;

  @Test
  public void testSendingMessage() throws Exception {
    // Add an interceptor. `context` is the Camel Context that's set up
    // for a CamelTestSupport test case.
    //
    // In a more complex setup I'd probably want to get the route by an
    // ID that I've allocated to it ratehr than by index, but in this
    // case I'm happy that the route at index 0 is going to be the route
    // I want to test.
    //
    // I should probably do this in a setUp method.
    //
    context.getRouteDefinitions().get(0).adviceWith(context, new RouteBuilder() {
      @Override
      public void configure() throws Exception {
        // Intercept the log:result endpoint - that's where I'm
        // planning to send the results of the route.
        interceptSendToEndpoint("log:result")
          // I don't want to let the flow continue to the
          // actual endpoint after I've intercepted a message.
          .skipSendToOriginalEndpoint()
          // Send intercepted messages to the endpoint
          // controlled by me in the tests.
          .to("mock:result");
      }
    });

    // I'm going to send a string to the route.
    String bodyString = "body";

    // I expect to get back well formed XML containing that string.
    String expectedBody = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><test>" + bodyString + "</test>";
    resultEndpoint.expectedBodiesReceived(expectedBody);
    template.sendBody(bodyString);
    resultEndpoint.assertIsSatisfied();
  }

  @Override
  protected RouteBuilder createRouteBuilder() throws Exception {
    return new MyRouteBuilder();
  }
}
{% endhighlight %}
