---
title: My Thoughts On VCR
layout: post
author: Craig
---


Not even halfway through writing this and I'm realising that my dislike isn't
VCR. VCR is a good tool - one that I don't use, but still a good tool.

My dislike is the way that too many people assue that VCR is the be-all and
end-all. VCR doesn't cover quite a few external API failure cases without your
help. You need to consider failure cases to make a good service. VCR doesn't
encourage (or discourage) good practice. You still need to think about the
structure of your code, remember the single responsibility principle,
refactor, etc.

Pushing this post now as a draft because I'd like to finish it off to show how
my code might develop if I was using VCR and if I wasn't... but I'd also like
sleep :)








## What is VCR?

  - Write normal code, don't always hit external API
  - Hooks into underlying HTTP implementation, caches responses
  - Cache key, expiry time, etc. are configurable

## Why am I talking about it?

  - Discussion with @t_crayford
  - Reminded me of frustrations on previous projects
  - Called it an abombination - not so cool of me (sorry @myronmarston, and thanks for contributing so much to the community), lots of hard work gone into the project, lots of people use it, it doesn't help me write cleaner code so I don't use it.

## How have I seen it used?

  - Payment processing - taking card payments - where external API charges for each request

## What do I like about it?

  - Makes easy work of testing external APIs
  - Captures fixture data for API calls
  - Don't need to worry about network access to test after capturing fixtures
  - Don't need to worry about external API being up to test
  - External API access won't slow test suite down as much: no network traffic
  - Tests look pretty much like the real code, there's little setup like I'd have to do with eg Fakeweb for a complex HTTP interaction

## What do I dislike about it?

  - Tests look pretty much like the real code, there's little setup like I'd have to do with eg Fakeweb for a complex HTTP interaction - and so there's less pain, easier to miss that cue to refactor.
  - Makes me less likely to think about failure cases - what happens when the API /is/ down or overloaded? Or just being too slow?
    + Can still be tested, but I'm less likely to consider failure cases when everything is fine all the time
  - Can hide API changes - what happens when the external API is updated or parts of it are deprecated?
  - Fixtures may be set to expire to help manage that - doing so makes having repeatable tests quite hard. Failure on CI for the past hour was because the fixtures expired there and hit the API when it wasn't responding correctly. Can't duplicate locally; my test run got the fixtures when the API was fine. Can I ignore the tests and deploy?
  - Expiring fixtures vs not being connected to network
  - Doesn't make me think about isolation of the test subject (which is fine if writing acceptance tests, may be okay for integration tests, and isn't cool for unit tests)
    + Again can still do this properly but less likely to consider issues when everything just works
  - Doesn't encourage separation of concerns
    + My MovieTicketPurchase class probably doesn't need to be concerned with HTTP, just with buying tickets for a movie
    + Less likely to feel testing pain so less likely to think about separating concerns when using VCR
    + I'm less likely to think about dependency injection or service locators eg before

    class MovieTicketPurchase
      def initialize movie
        self.movie = movie
      end

      # I'm coupled to the HTTP implementation.
      # I can't test without stubbing or mocking HTTP endpoints all over
      # the place.
      # If the ticket db changes my MovieTicketPurchase needs to change.
      # That feels wrong.
      def execute
        Net::HTTP.open 'ticketdb.com' do |http|
          response = http.post '/reservations', ...
          # TODO: handle all the error cases
          reservation = JSON.parse response.body
          http.put "/reservations/#{reservation["id"]}", :confirmed => true
        end
      end
    end

    # Becomes this ->

    class MovieTicketPurchase
      attr_accessor :ticket_database
      private :ticket_database=, :ticket_database

      attr_accessor :movie
      private :movie=, :movie

      # Something else tells me what I use to book tickets
      # As long as it responds to the same interface I don't care if it's
      # HTTP, FTP, email, or even some weird automated phone system.
      def initialize movie, ticket_database
        self.movie = movie
        self.ticket_database = ticket_database
      end

      def execute
        reservation = ticket_database.reserve_ticket movie
        ticket_database.confirm reservation
        ...
      end
    end

In the first example I need to use something like VCR - and something like
VCR makes the first one very easy to test.

The second one is cleanly decoupled. I can test the second one without needing
to worry about HTTP at all, just by passing in a TicketDatabaseTestClient,
which feels nice to me. Of course, for at least one of the ticket_database
implementations I'll need to test an HTTP endpoint, but it feels more right
that the TicketDatabaseHTTPClient knows about HTTP than having the
MovieTicketPurchase know about HTTP.

  class TicketDatabaseHTTPClient
    def reserve_ticket movie
      Net::HTTP.open 'ticketdb.com' do |http|
	response = http.post '/reservations', ...
	# TODO: handle all the error cases
	reservation = JSON.parse response.body
      end
    end

    def confirm reservation
      Net::HTTP.open 'ticketdb.com' do |http|
        http.put "/reservations/#{reservation["id"]}", :confirmed => true
      end
    end
  end


