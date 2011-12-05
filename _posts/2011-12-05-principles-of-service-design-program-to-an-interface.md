---
title: "Principles of Service Design: Program to an Interface"
layout: post
author: Craig
---

I've been thinking a fair amount about service design recently, and one of the
things that I've found difficult is deciding hot to implement and version a
service in such a way that makes it pretty trivial to support (or not) older
versions of that service. Turns out that advice which was meant to be for
writing code works for writing services too viz. Program to an Interface.

## Program to an Interface

Borrowing from a lot of blogs and books, I've decided that viewing a service
interface in the same way I'd view a programming interface will help me.
Interfaces can be versioned, they isolate the client code from the
implemention of the interface, and versions should be immutable once
published.

It is desireable that a service hide implementation details so that if, for
example, a database table changes inside an application which is providing a
service, the clients of that service should not have to change.

Much like interfaces in a programming language, by specifying a well known
interface to the service we free ourselves from having to worry about how
clients of our service interact with the service, so whenever we need to
change the implementation of our service we can do so without worry, and
vice-versa; clients of our service do not need to worry about the service
implementation changing as long as the interface remains consistent.

Of course, interfaces may have to change as we try to support new
functionality, and when they do change we want to be confident that we're
using the correct version of the interface; just because v2 has been
released, that doesn't mean our clients automatically support it. We want to
continue using v1 until we get a chance to update our a client code.
Interfaces should be versioned to give us that choice.

When we think of a service we generally think of a web service and in these
heady ReSTful days the interface is generally though to be the combination of
URIs that we interact with. That's not strictly correct. Supporting an
interface does not just mean that your URIs are manageg between service
versions, it also means that the content returned from service calls (ie
HTTP requests).

Of course, a web service is only one kind of service; it's quite possible to
have services that do not have a web interface, most usually in situations
where processing not suitable for synchronous request-response style messaging
that is usually provided by a web services, situations such as order
processing or inventory handling, where we may take several seconds to confirm
an order is valid and paid for, that there is stock and that the order meets
some anti-fraud criterea which we have defined. The interface to these
services should also be versioned for the same reasons as as web service
should be.

The version of the interface we are conforming to should be detectable with
each message passed or sent, no matter the transport or service type used; we
should know that we're dealing with version *3* of an API and not just that
we're talking what might be some version of the API and trying to guess which
one to use.

Handily, versioning interfaces for these types of services is pretty much the
ideal use for a mime-type, and most message transports support setting custom
mime-types:

* [HTTP 1.1 supports a Content-Type header][0]
* As does [Stomp 1.1][1]
* And [AMQP 1.0][2] (search for 'content-type')

Mime types have a space reserved for vendor specific types, `application/vnd`,
inside which we are free to define our own types, although thre are a few
conventions which are useful to make sure we do not have name collisions.
Name your mime types such that they to include your organisation name, a very
short - one or two words - description of what they're representing, a version
number, and a base format.

For example, say you worked at the Acme Toy Company, and when your web service
accepted an order via its ReSTful interface it would put on a message queue a
message with four fields, `customer_id`, `purchase_order_id`, `amount` and
`description`, in a JSON representation:

    {
      "customer_id": 123,
      "purchase_order_id": "ASLA-001-2031",
      "amount": 1000,
      "description": "100 x Acme Toy Dynamite"
    }

We could coin a mime-type, `application/vnd.acme.order-v1+json`, and publish
an interface specification that says any message claiming to be
`application/vnd.acme.order-v1+json` would have these four fields. Then in a
consumer of the orders message queue we could use the [Selective Consumer][3]
pattern to subscribe to the queue asking for just messages of this mime-type.
Inside the consumer we can now be fairly confident that we will deal with only
orders which we know the format of and can process. We could have parters POST
messages with this mime type in the Content-Type header so we know we're
talking about the same thing all the way through the system.

A few months pass, several partners are using the order API, but we want to
automate our stock inventory systems, so we decide that instead of a plain
text description we want item ids. We don't want to force this change on our
partners however, because their development cycle is slow and they're sending
us loads of orders - we like their cash.

We can now publishe a second version of our order interface,
`application/vnd.acme.order-v2+json`, which defines messages which look like
this:

    {
      "customer_id": 123,
      "purchase_order_id": "ASLA-001-2031",
      "amount": 1000,
      "items": [
        { "item_id": 1032, "quantity": 100 }
      ]
    }

It's now pretty trivial to add a second [Selective Consumer][3] which consumes
only `application/vnd.acme.order-v2+json` messages and updates our inventory
accordingly. There's no reason that the v1 conumer can't keep running and
working with v1 orders, and there's a smooth and unhurried migration path for
our clients from version 1 to version 2 of our API. We can easily support both
versions or reject older versions as we choose. We could even use some
combination of [Splitter][4], [Translator][5] and [Enricher][6] to route the
v2 message into the consumer for the v1 messages whie splitting off the
inventory management messages and routing them to a tiny consumer elsewhere.
None of this matters to our partner however, because they know that they're
working to the interface we've defined.

We may eventually decide that the ReSTful order service is not appropriate for
v3 of our service; perhaps we bought over by web 2.0 hip kids and want to use
WebSockets because hey, those are cool, right? When we receive an order which
claims to be v1 or v2 on the ReSTful service we can still happily accept it,
if we receive anything else we can return an [HTTP 406][7] to tell the client
that we can't accept orders that way for v3.

In contrast, if we had used `application/json` we'd have to do some sort of
guessing based on the message fields we were passed to know which version of
the service the client wanted to us. This would be just about practical with
the trivial example above, but it's messy, and once there are several versions
of the service interface it becomes much harder.

[0]: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.17
[1]: http://stomp.github.com/stomp-specification-1.1.html#Header_content-type
[2]: http://www.amqp.org/confluence/download/attachments/720900/amqp.pdf?version=1&modificationDate=1318011006000
[3]: http://eaipatterns.com/MessageSelector.html
[4]: http://eaipatterns.com/Sequencer.html
[5]: http://eaipatterns.com/MessageTranslator.html
[6]: http://eaipatterns.com/DataEnricher.html
[7]: http://barelyenough.org/blog/2008/05/versioning-rest-web-services/
[8]: http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#sec10.4.7
