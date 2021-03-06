---
title: Logging Considerations
layout: post
author: Craig
---

From years of bitter experience looking at log files trying to work out what
happened to turn the servers into a pile of molten rubble I've built up a list
of what I really like to see when a process is logging its activity. Prompted
by some discussions at work, I'd like to share my listof things that I
consider to be lovely logging practice in the hope that I can help increase
the quality of logging in our software and save some people a lot of stress at
3am when their project absolutely refuses to work and they can't find out why.

This is explicitly not about logging frameworks; I don't particularly care how
it's implemented in code since this will necessarily be different depending on
the language and the architecture of the application, I just care about the
outcome.

* Each process logs to one log file

  I don't want to jump back and forth between log files, interleaving lines,
  trying to work out what happened when. It's hard enough to work out what's
  going on at the best of times, let's not make it any more difficult.

* Each log file has one process, one thread writing to it

  When there are two or more processes or threads writing to the same file
  it's hard to find out exactly what the process you're interested in has
  done. You can get around that by adding a token to each log line eg the
  process or thread id, but there are further complications to consider before
  that.

  Say thread A logs something at exactly the same time as thread B. Halfway
  through thread A writing the log entry, something happens that means thread
  B is suddenly active, and thread B starts logging. Thread B eventaully
  yields, and thread A resumes. My, what a mess. The log entry sent by thread
  A has the log entry from thread B right in the middle. Who said what?
  Nightmare!

  When you can't avoid having multiple processes or threads writing to a log
  file, they should talk to some logging arbitrator service that manages the
  log file to ensure log entries are written as provided and not interrupted.

* Logging is not buffered

  When it comes to logging, I prefer to know that my logs are complete and up
  to date rather than being fast. If the process dies or is killed, I don't
  want the logs to be stored in buffers somewhere in memory, I want them on
  disk where I can read them! If I my process does something I should be able
  to see what straight away, I don't want to wait for a few minutes while the
  buffer fills up or the flush interval expires.

* Each log line has a timestamp

  This seems obvious, but I'm amazed by how many times it doesn't happen. A
  log file without a timestamp against each entry is useless unless I'm
  watching the log file when something happens.

* Each timestamp is at sub-second resolution

  Logging with timestamps that are accurate to only one second is very
  frustrating when you're dealing with thousands of log entries a second.
  Which of those items caused the issue? Argh!

  Given the choice, I'd prefer that you let me configure the logger to print
  to STDOUT for this so I could use `svlogd` to add tai64n timestamps (and to
  do much more besides) but, you know, just do something reasonably sane and
  I'll be happy.

* Each log file has a guaranteed maximum size

  Ever seen what happens when a process tried to start and the disk has filled
  up with old logs? Generally it doesn't work. That's annoying.

  Older logs should be archived somewhere else, only recent logs should be
  kept on local disk for easy debugging. Your definition of older logs and
  recent logs will, of course, vary, but knowing that you're only keeping eg
  1Gb of logs on the disk means you can ensure you always have enough disk
  space.

  Ad hoc or interval based log rotation does not help here, because by the
  time the log is rotated the disk is already full. Processes like `svlogd`
  and some syslog implementations can help here.

* There's some way of processing a log file once it reaches a known size

  At some point I'll want to analyse and archive log files, and it's annoying
  to miss the rotation trigger and discover that I've missed several hours of
  log entries. Please don't make me track file rotation myself, I'll do it
  badly, and that will make me sad.

Most of these are legacies of my working with (and being spoiled by)
DaemonTools and Runit, and coming from a Rails-centric Mongrel-running world
where there's typically one process logging to one file and doing anything
other than that would be odd. If there's something I've not considered, please
do let me know; email address is below.
