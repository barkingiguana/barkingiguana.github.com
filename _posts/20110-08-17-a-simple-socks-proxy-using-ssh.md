---
layout: post
title: A simple SOCKS proxy using SSH
author: Craig
---

It's pretty easy to forget to add a firewall rule that allows people to access a
resource such as an internal staging server from outside your network. To make
sure the server is available I needed my requests to come from outside the
internal work network but I wanted to be able to do this right now, using the
computer that's inside the network.

Turns out that's pretty easy using a tool that pretty much every developer
should have installed - [SSH][1].

There are just three steps to getting this setup and working.

  1. Run a server somewhere that you can access using SSH.
     [EC2][2] is ideal for this sort of thing.

  2. Open an SSH connection to it, telling it to act as a proxy (the -D flag
     does this, the other flags are for compression and similar goodies):

       ssh -C2qTnN -D 8080 your-server-name-here.com

  3. Configure your browser to use a SOCKS proxy. It's running on localhost on
     port 8080.

Once you've done that, hit up [whatismyip.com][3] and you should see the public
IP address of the server you're connecting shown on the site.

[1]: http://openssh.com/
[2]: http://aws.amazon.com/ec2/
[3]: http://whatismyip.com/
