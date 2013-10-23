---
title: Project Assumptions
layout: post
author: Craig
---

I make a lot of assumptions about how a project will be structured based on my past experience. this can make it difficult when joining a new team, as they will ahve made a different set of choices and their decisions will be based on different requirements and shared experiences. I thought it would be useful to document my assumptions, choices and the reasons behnd them so I can compare and contrast them with the decisions of the team. Not all of these will apply to all projects.

## Projects are installed using Boxen

### Description

I expect to be able to set up projects and their dependencies by running Boxen. When a new project is created, the related project manifest is created in Boxen.

Boxen is not used as a one-off initial setup with ad-hoc machine customisation, Boxen is the single source of truth for what is installed on my machine and is run frequently (several times a day in my case) to pull in any updates.

I do not expect Boxen to manage the project repository for me via Git pull or similar, this is part of my workflow when I am working on the project.

### Reason

Much the same as any Configuration Management, I am attempting to reduce the probability of human error creeping in. I want my local setup to be as close to the other developers as possible.

## Projects do not know how they are deployed

### Description

There is an external deploy project which manages the deployment of applications in a repeatable, controlled and consistent manner.

It is possible and probable that this deployment mechanic is automated.

### Reason

My ultra trendy social blog 2.0 application doesn't need to care whether it's being deployed via Capistrano, RPM, SCP or anything else.

The commit history should be related to application level changes, not infrastructure.

## Projects are configured using environment variables

### Description

Anywhere that a project behaviour deviates from the default or can be configured, that configuration is done via environment variables.

I try to avoid using Rails' environments to capture these differences, sticking with only the default 3: test, development, production.

In a production or production-like environment I use the excellent `runit` and `chpst -E ...` to set environment variables per-process. I use Dotenv to provide defaults for test and development. Note that Dotenv does not overwrite environment variables which are already present, making it excellent for providing default values.

### Reason

Configuration should be managed by Configuration Management which is external to the application behavour. Commit history for the application should be a log of application level changes. Similarly for infrastructure changes.

Three environments because there's no need for any more if everything is configured using the environment, and if I add another cluster of servers to e.g. run a different branch of my application repository I don't want to have to add another environment file to support that.

## Projects are internationalised and localised from the start

### Description

Rails has built-in helpers for internationalisation. They're trivial to use, but hardly anyone does.

### Reason

When the time comes to internationalise a site it is extremely painful to hunt down every single string, date or number and retrofit the helpers. I've done this several times and I *never* want to do it again.

## Logging is to STDOUT and STDERR

### Description

Not much to this one: log to STDOUT and/or STDERR instead of a file.

### Reason

Disks fill up, and when they do bad things happen. Since I use `runit` I get `svlogd` which deals with logs *beautifully*.

## Service Oriented Achitecture by default

### Description

This can be very hard to retrofit, especially after a few months of organic growth. Were possible I try to write lots of smaller projects with nice clean APIs.

### Reason

Smaller projects are easier to understand and less risky to change - it's usually possible to keep the entire codebase in your head at one time.

Smaller projects are faster to test - the entire test suite can be complete in the time it takes to run the unit tests for a larger project.

Services can be used to provide authoriative sources for information to several applications. Where this information is baked in to the application it would require them to b echanges, retested, redeployed. A reasonable example of this may be VAT in the UK. It was always 17.5%... except when it was fairly quickly changed to 20%.
