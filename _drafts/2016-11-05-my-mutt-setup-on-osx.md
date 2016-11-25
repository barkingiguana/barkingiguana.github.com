---
title: My Mutt Setup on OSX
layout: post
author: Craig
---

I've been using [tmux][0] a lot recently. Two things that cause me to switch out of the terminal at looking up documentation online, and email. Recently, after upgrading OSX to Sierra, my Mail.app plugins stopped working. It feels like a good time to examine alternative mail clients.

In the past I've dabbled with [mutt][1]. I know I like it, but it's always felt a little too complicated to set up for multiple GMail accounts, never mind searching and offline use.

Over the next week or so I'm planning to start with a fairly simple mutt setup using a single account, and adapt that to do what I need it to do.

Let's make a start.

## Day 1: A basic Mutt + GMail setup

```
brew install mutt
```

`~/.muttrc`:
```
# My details
set from = 'craig@xeriom.net'
set realname = 'Craig Webster'
set imap_user = 'craig@xeriom.net'

set folder = 'imaps://imap.gmail.com:993'
set spoolfile = '+INBOX'
set postponed = '+[Gmail]/Drafts'

set imap_keepalive = 900
```

I want to make it use as secure communication settings as possible:

```
# SSL hardening
unset ssl_usesystemcerts
set certificate_file=~/.mutt/certificates

set ssl_force_tls=yes
set ssl_starttls=yes
set ssl_use_sslv2=no
set ssl_use_sslv3=no
set ssl_use_tlsv1=no
set ssl_use_tlsv1_1=no
set ssl_use_tlsv1_2=yes
set ssl_verify_dates=yes
set ssl_verify_host=yes
```

`mutt` - accept certificates "(o)nly once." Enter password. Bam, reading email! Well, except when offline. We'll address that later.

Threading:
```
set sort=threads
set sort_browser=date
set sort_aux=reverse-last-date-received
```

Archiving (when quitting `mutt` - not yet sure how to do it when the message is read):
```
set mbox = "imaps://imap.gmail.com/[Gmail]/All Mail"
set move = yes
```

## One account - usability
* Remember passwords - unencrypted but chmod'd. Teribly idea - not that upcoming security post will fix this.
* Vim to edit email - this is my $EDITOR, and I’m comfortable using it
* Actually sending emails
  Just smtp in mutt - not that we can't queue.
* I’d like to quickly find things
* Mutt sidebar patch

```
# My preferences
set editor="vim +13 -c 'set nobackup' -c 'set noswapfile' -c 'set nowritebackup' -c 'set tw=72 ft=mail noautoindent'"
```

## One account - HTML email
* Readable HTML email
* Can open links in Safari from the mail
* Can I search HTML email?

## One account - contacts and aliases
* Sending as Gmail aliases
* Integration with Apple Contacts (lbdb)

## One account - shortcuts for common actions
* Single key ability to mark as spam
* Single key ability to forward to known email address (my bot) for other processing
* Open links in Safari

## One account - offline, for travelling & speed of use
* Possible to use offline and queue email for sending next time it’s online
* Stop the XOAUTH2 error.
* Niceness: Mailboxes file for mutt, so we don’t have to maintain two lists - great for sidebar

## One account - security
* Validate GMail certificates and remember them:
  http://dcors.blogspot.co.uk/2012/03/gmail-mutt-imap-msmtp-tiny-howto.html
* Passwords encrypted on disk using GPG
* Local mail encrypted - perhaps some sort of loopback disk?
* Encryption and decryption using the appropriate GPG key for the account
* Signing possible but not default
* Verification of signed messages
* I shouldn’t be able to search encrypted messages - that’d be insecure

## GPG - common operations
* Storing key - and what it means for encrypted email
* Sharing key - do I want to?
* Signing others key
* Getting my key signed
* Caff for making it all easier
* Extending my key
* Revoking my key

## Expand to multiple accounts
* Several email accounts
* Passwords
* GPG keys
* Signatures per account
* Send/receive per account
* Reply as account or alias that received email

[0]: https://tmux.github.io
[1]: http://www.mutt.org
