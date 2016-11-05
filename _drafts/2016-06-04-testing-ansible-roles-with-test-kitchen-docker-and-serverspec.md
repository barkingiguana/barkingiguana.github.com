---
title: Testing Ansible roles with Test Kitchen, Docker, and Serverspec
layout: post
author: Craig
---

Ansible for Configuration Management. Typically a single repo grows and grows
and becomes very interdependent and dificult to work with. To combat that we
retain the original repository with the mappings of servers to roles, but we
have well defined roles kept in separate repositories, pulled in using Ansible
Galaxy. *Note that Ansible Galaxy can pull in roles from private Git
repositories, you don't have to have a public Ansible role on the Galaxy site
to model your repository this way.*

Being concerned with keeping the infrastructure healthy, I want to test roles
to ensure they are working the way I expect - and that they keep working that
way as I make any necessay changes to them. There are lots of different ways to
test Ansible roles, but I'm a Ruby developer at heart. I'm used to using RSpec
for my Ruby projects. Serverspec is a thing, a wrapper around RSpec that
provides helpers for cehcking files, packages, processes, ports, users -
systems level things, the sort of things that Ansible would manage, and the
sort of things that I'd like to write tests for. Normally to run it I'd need to
install Ruby, serverspec, etc on the server I'm testing - but serverspec also
provides a remote ssh connection.

Most of the projects I work on use Docker Compose to provide an easy to launch
local development environment. This means I've got a Docker Machine in which I
can run nicely isolated containers, each based on a different operating system.
That makes it easy to run a command on CentOS 5, and check the output of the
same command on Ubuntu 14.04, for example. Exactly what I want if I'm testing
that my Ansible role works the same way across several OS's.

In order to document the way I test a role, I need to use a role as an example.
One role that is pretty simple but which crops up everywhere is what I call a
site root user. A site root user it the user that's commonly used for
administrative actions, but which isn't root. They have some sort of `sudo`
access to perform root-like things, but apart from that they're just a normal
user account. There are several pros and cons to have a shared root like
account, but that's a discussion for another time and place. For the moment, it
makes a simple role to help show how I could write tests for an Ansible role.

Test Kitchen provides a nice framework for bringing a configuration management
module, a set of supported operating systems, and a test suite, together.
