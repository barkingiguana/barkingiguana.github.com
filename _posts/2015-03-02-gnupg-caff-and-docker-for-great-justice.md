---
title: GnuPG, Caff and Docker
introduction: Getting it all up and running quickly
layout: post
author: Craig
---

I've been playing with GnuPG for a while, trying to find the right setup for me. I think I might have found it, so this is an attempt to document that before I forget everything.

## The Perfect Keypair

Following [instructions by Alex Cabal][0] I created a master keypair, which I stored on a USB key and keep secure. I also created a day-to-day subkey for that key which will be stored on my laptop and used for decrypting and signing messages sent to me.

One pretty important (for me) change: I made sure that all keys has an expiry date set. It's [pretty trivial][1] to extend the expiry date on a key or subkey so there's really no reason not to set one.

It's not totally clear from the provided instructions how you're meant to reconsititute the master keypair for signing. This is how I did it:

{% highlight bash %}
mkdir master-keypair
GNUPGHOME=master-keypair gpg \
  --allow-secret-key-import \
  --import \
    /path/to/master-keypair-public-key \
    /path/to/master-keypair-private-key
{% endhighlight %}

The directory `master-keypair` now has the original master keypair in it. To use it continue to point `GNUPGHOME` to it. Mostly though, I only mount it to sign keys using `Caff`.

## Caff

Once you've got a working keypair you probably want to do some key signing, or to get your own key signed. Maybe you've even [attended a keysign party][4]. You could sign all those keys by hand and email the results to the individuals, but it's a bit of a bother and can be quite error prone to do it all manually.

Caff automates away a lot of the fuss associated with signing other people's PGP keys. It's a bit annoying to get setup though, and assumes things like a local mail relay that isn't avaialble on my computer.

I've got Docker though, and that's pretty easy to get setup using [boot2docker][2]. Docker will let me run Caff and provide it the environment it wants. There's even a [pre-built Docker image for Caff][3]!

Of course, it would be too easy if that worked perfectly with my setup. Since I'm using the protected master keypair I need to get that into the Docker container instead of my day-to-day keypair. I also need to customise the `.caffrc` to provide a different keyserver since I couldn't get the default to work.

To mount the master keypair into the Docker container, I've modified the `caff` script to look like this:

{% highlight bash %}
#!/bin/bash

set -e

# Ensure the master keypair is mounted before continuing
readlink ~/.gnupg/master-keypair > /dev/null
if [ "$?" != "0" ]; then
  echo "Have you mounted your master keypair?"
  echo "It needs to be symlinked to ~/.gnupg/master-keypair."
  exit 1
fi

exec docker run -it --rm \
    --name caff \
    -e OWNER='Craig R Webster' \
    -e EMAIL='craig@barkingiguana.com' \
    -e KEYS='78782A6576E09768' \
    -v /Users/craig/.gnupg/caffrc:/home/user/.caffrc:ro \
    -v /Users/craig/.gnupg/caff-ssmtp.conf:/etc/ssmtp/ssmtp.conf:ro \
    -v /Users/craig/.gnupg/master-keypair:/home/user/.gnupg \
    tianon/caff "$@"
{% endhighlight %}

Note that I now mount the `master-keypair` on my laptop to `/home/user/.gnupg`, which provides the master keypair to Caff. I also mount `.gnupg/caff-ssmtp.conf` which contains my `ssmtp.conf` for sending through GMail, and I mount my custom `caffrc`.

## How to sign keys

Retrieve the media containing your master keypair from your ultra secure safe location, maybe at the bottom of a volcano or your super secret bank deposit box in Zurich. Mount it in your machine then symlink the master keypair to `~/.gnupg/master-keypair`. Now you can run Caff as normal:

{% highlight bash %}
caff 78782A6576E09768
{% endhighlight %}

This will guide you through signing the keys you provide with the command and sending them by email to the recipients.

When all signatures have been sent, unmount the master keypair and return it to the locked guarded room in the basement behind the leopards and the barbed wire. Remember to turn off the lights and turn on the lasers on your way out.

## Importing signatures received from Caff

Caff sends one email to each identity in the key that you're signing. Each email will be encrypted to that key. This ensures that before they can apply your signature to their key:

1. That the person whose key you're signing really has access to that email address.
2. They really have access to the secret key.

After decrypting each email will look like the following:

{% highlight text %}
Hi,

Please find attached the user id
  Their Name <the-identity@email.address.com>
of your key [key_id] signed by me.

If you have multiple user ids, I sent the signature for each user id
separately to that user id's associated email address. You can import
the signatures by running each through `gpg --import`.

Note that I did not upload your key to any keyservers. If you want this
new signature to be available to others, please upload it yourself.
With GnuPG this can be done using
  gpg --keyserver pool.sks-keyservers.net --send-key [key_id]

If you have any questions, don't hesitate to ask.

Regards,
Craig R Webster
{% endhighlight %}

Each email will have an attachment, the actual signature.

To import the signature, save the attachemnt to disk and do this:

{% highlight bash %}
gpg --import 0xSIGNEDKEYID.1.signed-by-0xSIGNEDBYID.asc
{% endhighlight %}

Success will look something like this:

{% highlight text %}
gpg: key SIGNEDKEYID: "Their Name <the-identity@email.address.com>” 1 new signature
gpg: Total number processed: 1
gpg:         new signatures: 1
gpg: 3 marginal(s) needed, 1 complete(s) needed, PGP trust model
gpg: depth: 0  valid:   3 signed:   1  trust: 0-, 0q, 0n, 0m, 0f, 3u
gpg: depth: 1  valid:   1  signed:   0  trust: 1-, 0q, 0n, 0m, 0f, 0u
gpg: next trustdb check due at 2015-07-28
{% endhighlight %}

They can then choose to publish their new signatures to a keyserver like so:

{% highlight bash %}
gpg --keyserver pgp.mit.edu --send-key SIGNEDKEYID
{% endhighlight %}

[0]: https://alexcabal.com/creating-the-perfect-gpg-keypair/
[1]: http://www.g-loaded.eu/2010/11/01/change-expiration-date-gpg-key/
[2]: http://boot2docker.io
[3]: https://registry.hub.docker.com/u/tianon/caff/
[4]: /2011/07/10/reposted-ten-steps-for-attending-a-keysigning-party
