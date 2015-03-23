---
title: Bash Pipes Execute In Subshells
introduction: (so they can't export environment variables)
layout: post
author: Craig
---

Scribbled summary of a thing I learned this week.

I had code like this used to source settings from scripts stored in other
folders:

{% highlight bash %}
find /etc/application -name "*.sh" -type f |while read FILE; do
  source $FILE
done

exec /path/to/application/run.sh
{% endhighlight %}

Inside `/etc/application/set_name.sh` I'd have some code like this:

{% highlight bash %}
export SOME_VARIABLE="some value"
{% endhighlight %}

Some oddness seemed to be happening though, when the application was running
it would never see the value of `SOME_VARIABLE`.

This is because I didn't know bash pipes run in subshells, so the subshell
is sourcing the `$FILE`. _Subshells can't modify the environment of their
parent process._

To get this to work the `source` needs to happen in the main process, so the
code needs to be rewritten something like this to use input redirection:

{% highlight bash %}
while read FILE; do
  source $FILE
done < <(find /etc/application  -name "*.sh" -type f)

exec /path/to/application/run.sh
{% endhighlight %}

Now the application can see the environment variables it's expecting. Yay!
