---
title: How I Structure RubyGems
layout: post
author: Craig
---

I'm not consistent in the way I structure my RubyGems, and I want to be so that I know what I need to provide, and so that people who use my code know what to expect.

Here are a few guidelines for my future self.


## Require statement is based on Gem name

I should know, from the name of your gem, which file I need to `require` to be able to access the core functionality that your gem provides.

* A gem called `nyan_cat` should need a require like this: `require "nyan_cat"`.
* A gem called `nyan-cat` should need a require like this: `require "nyan/cat"`.
* A gem called `nyan_cat-moar_cats` should need a require like this: `require "nyan_cat/moar_cats"`


## File structure

A basic project structure for a gem should look like this:

    your-rubygem/
                |- bin/
                |- lib/
                |- tests/
                |- Gemfile
                |- Rakefile
                |- README
                |- LICENCE
                \- your-rubygem.gemspec

The code that provides the functionality for your gem should be written under lib/ in a directory named according to these rules:

* A gem called `nyan_cat`: `lib/`.
* A gem called `nyan-cat`: `lib/nyan`.
* A gem called `nyan_cat-moar_cats`: `lib/nyan_cat`

There file required by "require statement is based on Gem name" should appear under `lib/` eg:

* A gem called `nyan_cat` should have this file: `lib/nyan_cat.rb`.
* A gem called `nyan-cat` should have this file: `lib/nyan/cat.rb`.
* A gem called `nyan_cat-moar_cats` should have this file: `lib/nyan_cat/moar_cats.rb`

This file should `require` everything needed for your Gem to work.

The Gemfile should contain just `gemspec`, and the Gemfile.lock should not be checked in for Gems. More on the role of Gemfile in gems at [http://yehudakatz.com/2010/12/16/clarifying-the-roles-of-the-gemspec-and-gemfile/](http://yehudakatz.com/2010/12/16/clarifying-the-roles-of-the-gemspec-and-gemfile/).


## Code structure / Gem namespace

Your gem should have a namespace that matches the directory structure:

* A gem called `nyan_cat` should have this namespace: `NyanCat`.
* A gem called `nyan-cat` should have this namespace: `Nyan::Cat`.
* A gem called `nyan_cat-moar_cats` should have this namespace: `NyanCat::MoarCats`

Everything should live under this namespace.


## Versioning

Provide a file, `version.rb`, which contains the current version of your Gem and nothing else. Be nice to people who use your Gem, stick to the [Semantic Versioning][0] scheme.

* A gem called `nyan_cat` should have this file: `lib/nyan_cat/version.rb`.
* A gem called `nyan-cat` should have this file: `lib/nyan/cat/version.rb`.
* A gem called `nyan_cat-moar_cats` should have this file: `lib/nyan_cat/moar_cats/version.rb`

An example `version.rb` for `nyan_cat/moar-cats` looks like this:

    module NyanCat
      module MoarCats
        VERSION = "0.0.1"
      end
    end


## Tests

Your code should be tested, but you don't need to distribute the tests in the Gem file.


## Logging

Unless you are providing a logger implementation, it is not your responsibility to configure logging. Logging is good, and can be very useful while debugging, so the solution is not to avoid logging. What I want to do is give your code a logger that *I* have configured to my liking. It will support the `Logger` interface. Please make the logger you use an option in your code, let me pass my logger to you, stop worrying about logging configuration.

You can easily allow this by using the `NullLogger` if no logger is passed to your code:

    require "null_logger"

    class Foo
      attr_accessor :logger
      private :logger=, :logger

      def initialize bar, options = {}
        self.logger = options[:logger] || NullLogger.instance
      end

      def quux
        logger.info "Called #quux"
      end
    end

Find out more about the NullLogger at [http://github.com/craigw/null_logger][http://github.com/craigw/null_logger].


## Dependencies

Read about your dependencies versioning schemes. Hopefully they use the [Semantic Versioning][0] scheme in which case you should depend on the appropriate version. Read about [using the "tilde wakka" operator][1] to depend on major, minor or exact versions of gems depending on their versioning scheme.


## Rake tasks

Provide tasks to run your tests. The default rake task should run all tests.


## README

Provide these things:

* A brief description of the gem, perhaps with an example of the problem it solves
* Installation instructions, even if they're just `gem install foo` or "stick X in your Gemfile"
* A brief example of using your gem, possibly with a link to more in-depth documentation
* Some licencing info, even if it's just "see the LICENCE file"
* A "how to contribute back to this project" section, which tells people how to submit patches for your gem
* A list of authors (it's nice to see your name here)


## Licencing

If you don't provide a licence, I can't use your project, because I don't know the terms under which I can use it. I really want to use your project. Please provide a licence.

[0]: http://semver.org/
[1]: http://blog.davidchelimsky.net/2011/05/28/rake-09-and-gem-version-constraints/
