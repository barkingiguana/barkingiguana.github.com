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
set from = 'craig@barkingiguana.com' # I use a GMail alias, so from and imap_user are different. That's on purpose!
set realname = 'Craig Webster'
set imap_user = 'craig@xeriom.net'

set folder = 'imaps://imap.gmail.com:993'
set spoolfile = '+INBOX'

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

Bam. I can now mark email as read.

## Day 2: Travel

The above is super, and I can now read email using Mutt... when I'm using a fairly reliable internet connection.

I am, however, writing this from a train. Reliable train internet does not appear to be a Thing in the U.K. What can I do about that?

`mutt` is more normally used with local mailboxes. I could do that, except GMail isn't a local mailbox.

OfflineIMAP lets me download a copy of my GMail account and store is as a maildir, which `mutt` can then use. Any changes to the state of the local maildir are synchronised with GMail on the next `offlineimap` run. I'll be able to read and delete emails that way. I'll then use something like `msmtp` to queue sent emails until the next time I'm online.

### OfflineIMAP

Install:

```
brew install sqlite offlineimap
```

I'll store all my mail under `~/.mail/`:

```
mkdir ~/.mail/
```

Configure.

I copied http://stevelosh.com/blog/2012/10/the-homely-mutt/ for the below, and edited to fit my own requirements.

```
TODO: Copy this from working settings & replace any secrets
```

Note the `transporttunnel` section above - we'll need to make sure we have an `openssl` install that can support TLS 1.2. The default version with Sierra only supports 1.0. Here we go:

```
brew update
brew install openssl
```

This installed 1.0.2j for me, which was sufficient.

Start the imap sync. This _might_ take a while if you've got a lot of mail, but since we're only syncing INBOX and Trash it took about 30 seconds for me.

```
$ offlineimap -o
```

Change `~/.muttrc` to use the offline Maildir that `offlineimap` gives us. Here's the entire file now:

```
# My details
set from = 'craig@barkingiguana.com'
set realname = 'Craig Webster'

set sort=threads
set sort_browser=date
set sort_aux=reverse-last-date-received

set move = no # Don't move read messages to the `mbox` when quitting `mutt`.
set copy = no # I think this is about copying a sent mail into the sent folder - gmail does that for me
set wait_key = no # TODO: Document why
set mbox_type = Maildir # Offlineimap will produce a Maildir for me
set timeout = 10 # Check the maildir for new mail after 10 seconds of inactivity
set mail_check = 0 # Don't check the maildir unless I'm inactive
set delete # don’t prompt me when quitting mutt, to delete messages that I’ve marked for deletion.
unset confirmappend      # TODO: Document why
set quit                 # TODO: Document why
unset mark_old           # I care if mail is read or unread, I don't care if it's unread and was seen in the last `mutt` session.
unset beep_new           # don't beep on new mails
set pipe_decode          # strip headers and eval mimes when piping
set thorough_search      # strip headers and eval mimes before searching

set status_chars  = " *%A"
set status_format = "───[ Folder: %f ]───[%r%m messages%?n? (%n new)?%?d? (%d to delete)?%?t? (%t tagged)? ]───%>─%?p?( %p postponed )?───"

color hdrdefault white black  # headers white on black
color header brightgreen black ^From:  # sender's name in green
color quoted cyan black  # quoted text in blue
color signature red black   # signature in red

set folder           = ~/.mail/craig@barkingiguana.com

set spoolfile = "+INBOX"
```

Once that initial `offlineimap` sync has completed I add it to my crontab:

```
cat>offlineimap.cron<<EOF
*/20 * * * * offlineimap -u quiet
EOF
crontab offlineimap.cron
```

* Possible to use offline and queue email for sending next time it’s online
* Stop the XOAUTH2 error.
* Niceness: Mailboxes file for mutt, so we don’t have to maintain two lists - great for sidebar

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
