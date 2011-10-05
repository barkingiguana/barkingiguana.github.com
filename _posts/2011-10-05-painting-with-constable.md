---
title: Painting with Constable
layout: post
author: Craig
---

ImageMagick annoys me. It annoys me mainly because it's a pain in the ass to
install. As functionality goes, ImageMagick is pretty much the bees knees, but
like many Ruby developers, I tend to develop on a Mac, an operating without
much of an official package manager. Installing tools that I use every day,
especially tools that have complex requirements like ImageMagick, gets to be a
bit annoying. I long for the days when I can `apt-get install imagemagick` but
still use all of the the rather lovely hardware that a Mac provides.

Over the past several years I'd had some reasonable experience with
virtualisation, and recently Vagrant has brought virtualisation to OS X in a
way that made it instantly, easily available. Suddenly it's trivial to run
Ubuntu on my Mac, and with that I get easy access to apt and the packages for
ImageMagick. Unfortuantely I can't use them natively on my Mac because they're
only accessible from inside the VM. Better than nothing though, and so for image
manipulation at the command line I've been surviving.

During my more recent three or four years of work I've tended to work a fair
amount with messaging, making services available on the message bus for use
by remote clients. It can be really useful not having to worry about the
implementation of a service, knowing just that a message in a certain format
sent to a certain destination will cause the work you've requested to be
done, so I tried to provide exactly that for ImageMagick by exposing ImageMagick
on my VM as a sevice on the bus. It seems to work fairly well, so I've thrown up
a [project on GitHub][0] and [released a RubyGem][1]. The project is called
Constable, the [README][2] explains why.

[Constable][0] is *very nearly* a drop-in relacement for ImageMagick. After
you've installed the gem and setup the service you can use the same
ImageMagick commands to do a lot of the same stuff that a local install of
ImageMagick would let you do, but of course there are come caveats. Output
must, at the moment at least, be streamed to `STDOUT`. ImageMagick supports
this by allowing your output filename to the the form of `format:-` eg
`jpg:-` or `png:-`. While there are probably other shortcomings, I've not
run into them, possibly because while I use ImageMagic a lot I don't use it
in a particularly complex manner. If you do come across any problems let me
know. If you can submit a patch to fix any problems you encounter I'd be a
happy boy.

Setting up an example service is covered in the "Up and runing fast" section
of the [README][2] so I'll skip that and run through a very quick operation to
show creating a few JPEGs with text in them, pasting one on top of the other,
and creating a PNG that's 50% smaller in dimension that the original images.

First, of course, make sure the service is up as described in the [README][2].

Second, and a little bit of an undocumented easter egg at the moment, install
the binstubs for the ImageMagick services.

    sudo constable-install

Note that this will overwrite the following files if they exist:

    /usr/bin/identify
    /usr/bin/convert
    /usr/bin/compare
    /usr/bin/composite

This step is optional, but does provide the same commands that ImageMagick
uses.  If you prefer not to perform this step you can simply prefix each
command with `constable-` and immediately after each command add a double
dash eg. `convert foo.jpg png:-` becomes `constable-convert -- foo.jpg
png:-`

Now on to actually using the sevice. Creating text based images is pretty easy
using the `convert` command; here I create two JPEGs, one in blue tones with the
text "Anthony" which I stream to `anthony.jpg`, and ther other in pink tones
with the text "Cleopatra", which I stream to `cleopatra.jpg`:

    convert -background lightblue -fill blue -font Candice -pointsize 72 \
      label:Anthony   jpg:- > anthony.jpg
    convert -background pink      -fill red  -font Candice -pointsize 72 \
      label:Cleopatra jpg:- > cleopatra.jpg

They don't look great, but they're good enough for a simple demonstration:

* ![Anthony](/images/anthony.jpg)
* ![Cleopatra](/images/cleopatra.jpg)

To combine them we can use the `convert` command in a different invocation:

    convert anthony.jpg cleopatra.jpg +append jpg:- \
      > anthony_and_cleopatra.jpg

Resulting in this magnificent creation:

* ![Anthony and Cleopatra](/images/anthony_and_cleopatra.jpg)

Finally we can convert the image to a PNG at 50% of the size of the input
image, again using `convert`:

    convert anthony_and_cleopatra.jpg -resize 50% png:- \
      > anthony_and_cleopatra.png

Which outputs the smaller PNG:

* ![Smaller PNG](/images/anthony_and_cleopatra.png)

This demonstration will work both with the service running in the VM and a local
ImageMagick install. I'm rather happy with that, but there's no reason to stop
there. Why not expose this as a real service somewhere and write a plugin for
AttachmentFu or Paperclip that uses this service to properly offline image
processing? Get that crazy stuff out of the request response cycle!

Anyway. [The code is out there][0], it's pretty badly written but it works and
it's available for you to use. Let me know if you find it useful, and if you'd
like to do something that it can't yet do, please do submit patches or give me a
yell.

[0]: https://github.com/craigw/constable
[1]: https://rubygems.org/gems/constable
[2]: https://github.com/craigw/constable#readme
