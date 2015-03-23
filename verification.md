---
layout: page
---

You can check that each post I publish, as well as this page with the verification instructions on it are written by me by using [GnuPG]. So you'll probably want to install GnuPG.

Verifying that I've written what you're reading are the same thing is pretty easy.

For each article you'd like to verify, there's a section at the bottom of the page that will show you how to download the article source and the signature for that article, and how to verify the signature using [GnuPG].

Success looks something like the below - note the `good signature` line, this shows that what I've written hasn't been changed since I signed it. Check that the content is signed by me, and if you're in any doubt email me to check.

{% highlight text %}
gpg: Signature made Wed  4 Mar 11:11:28 2015 GMT
gpg:                using RSA key 2A476286B44D1E2E
gpg: Good signature from "Craig R Webster <craig@barkingiguana.com>" [ultimate]
gpg:                 aka "[jpeg image of size 3895]" [ultimate]
{% endhighlight %}

Unless you or someone in your web of trust has signed my key you're likely to see `[unknown]` at the end of the `good signature` line. This means that while GnuPG can verify that my signature was made against the article that you downloaded, you have no way to determine that the key used to generate the signature is actually owned by me. You can fix this by extending your web of trust until it connects with me or someone I know. Perhaps you'd like to [attend a keysigning party]?

[GnuPG]: https://www.gnupg.org/
[entire blog in GitHub]: https://github.com/craigw/craigw.github.com/
[attend a keysigning party]: /2011/07/10/reposted-ten-steps-for-attending-a-keysigning-party/
