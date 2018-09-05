---
title: Building Raspberry Pi images on OSX using Ansible
layout: post
author: Craig
---

We're going to:

* Mount volumes from Mac to Docker using the root and boot image, exposing
  the image files to the Docker container at known locations - the same
  places they'd be in a running Pi.
* Use the Ansible chroot connection to move into the root of the Pi image,
  so we can think about Ansible playbooks for this image in almost the same
  way we would for a running Pi.
* Use Qemu ARM inside the container, and `DEFAULT_EXECUTABLE` for the
  Ansible chroot connection, so we don't have to do any funky things with
  Apt or Yum or PATH to get the expected behaviour.

I said we could write playbooks _almost_ the same way as we normally would,
above. The difference is, we don't normally want to run services as part of
these plays. We especially don't want to try to load firewall rules. I've
worked around this by making all Pi images get added to to a `chroot` group,
and set Ansible group_vars for that group to let my various roles know that
I don't want to run the handlers, just to install and configure things.
