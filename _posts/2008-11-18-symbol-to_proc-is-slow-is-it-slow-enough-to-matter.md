---
title: "Symbol#to_proc is slow... is it slow enough to matter?"
layout: post
author: Craig
---

It's common knowledge that using the to_proc hack is slower than not. Just how much slower is it? I decided to put together a few benchmarks to find out.

### Environment

These tests were run on Ruby 1.8.6-pl111 and Rails 2.1.

### Benchmarking

Say there's a database of 1,000 items that for some reason you want to iterate over. Let's forget that if you're showing 1,000 items you probably have usability issues and just roll with it.

{% highlight ruby %}
1_000.times { |n| Bar.create :name => "bar-#{n}" }
bars = Bar.find(:all)
{% endhighlight %}

Here's how much slower it is over a dataset of 1,000 ActiveRecord instances.

{% highlight ruby %}
Benchmark.measure { bars.map(&:name) }.real
#=> 0.00645709037780762

Benchmark.measure { bars.map { |b| b.name } }.real
#=> 0.00141692161560059
{% endhighlight %}

Now that's a horrific increase: it takes more than 350% longer to run the to_proc hack than the plain block... but let's be realistic here, over 1,000 records it's taken 0.0065 seconds. Big woop. Who cares?

How about over 1,000,000 rows? We already have 1,000 rows, let's top that up.

{% highlight ruby %}
(1_000_000 - 1_000).times { Bar.create :name => Time.now.to_f.to_s }
bars = Bar.find(:all)
{% endhighlight %}

That makes it 1,000,000 rows in the table. By this stage your database is probably thinking you hate it. I'm pretty confident that presenting 1,000,000 rows to the person using your application is a bit of an edge case, but hey, here's how long it takes

{% highlight ruby %}
Benchmark.measure { bars.map(&:name) }.real
#=> 6.25304508209229

Benchmark.measure { bars.map { |b| b.name } }.real
#=> 1.38965106010437
{% endhighlight %}

Almost 5 seconds extra over a million rows. Okay so 5 seconds is a pretty big hit, but how long will your application be running before you hit a million rows in one of your tables *and* you need to iterate over all million rows?

Don't optimise your code prematurely. By the time to_proc becomes an issue you'll already have hit many, many other problems.

{% highlight ruby %}
Benchmark.measure { Bar.find(:all) }.real
#=> 406.738657951355
{% endhighlight %}

Worry about those first.

### Run it yourself

It's been a long time since I ran this benchmark. Here's some copy/paste code to run a similar one yourself.

{% highlight ruby %}
require 'benchmark'
puts "PLATFORM = #{RUBY_PLATFORM}, VERSION = #{RUBY_VERSION}"
Benchmark.bmbm do |x|
  x.report("to_proc") { 10_000_000.times &:to_s }
  x.report("literal") { 10_000_000.times { |n| n.to_s }}
end
{% endhighlight %}

Here are the results from my MacBook Air on Ruby 2.1.2 - rather interesting results:

```
Rehearsal -------------------------------------------
to_proc   2.010000   0.000000   2.010000 (  2.027541)
literal   2.150000   0.000000   2.150000 (  2.157515)
---------------------------------- total: 4.160000sec

              user     system      total        real
to_proc   1.920000   0.010000   1.930000 (  1.933398)
literal   2.030000   0.000000   2.030000 (  2.027449)
```
