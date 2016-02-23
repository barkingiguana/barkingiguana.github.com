---
title: Setting up a new laptop with a GnuPG signing key
introduction: Getting it all up and running quickly
layout: post
author: Craig
---

Previously [I created signing and master keypairs][0], so that I could
safely use the master keypair to revoke any signing keypairs that were lost.

However, I didn't know how to create a new signing keypair. Here's a
script that'll set up a new computer with a new signing keypair.

{% highlight bash %}
#!/bin/bash

# Do we know the GPG passphrase?
if [ "x" = "x$PASSPHRASE" ]; then
  echo "You need to tell me the PASSPHRASE"
  exit 1
fi

# Make sure the master keypair is available on the USB stick
USB_KEY_PATH="/Volumes/Survivor/master-keypair"
if [ ! -d "$USB_KEY_PATH" ]; then
  echo "Have you mounted your master keypair?"
  echo "I'm expecting it on ${USB_KEY_PATH}"
  exit 2
fi

# Check we're setting up the computer from fresh
DEFAULT_GNUPGHOME="$HOME/.gnupg"
if [ -d "${DEFAULT_GNUPGHOME}"" ]; then"
  echo "$HOSTNAME appears to be already set up for GnuPG"
  echo "If you'd like me to set it up again, delete ${DEFAULT_GNUPGHOME}"
  exit 3
fi

# Create a working directory
mkdir -p "$DEFAULT_GNUPGHOME"
export GNUPGHOME=`mktemp -d "${DEFAULT_GNUPGHOME}/XXXXXXXXXXXXXXXXXXXXXX"`

# Import master key-pair from removable media
gpg \
  --allow-secret-key-import \
  --import \
    "${USB_KEY_PATH}/craig@barkingiguana.com-public-key.bak" \
    "${USB_KEY_PATH}/craig@barkingiguana.com-private-key.bak"

# Get the key fingerprint
FINGERPRINT=$(gpg --list-secret-keys --with-colons --fingerprint \
  craig@barkingiguana.com | egrep '^fpr:::::::::' | cut -d : -f 10)

# Create new signing subkey:
echo addkey$'\n'8$'\n'e$'\n'q$'\n'4096$'\n'1y$'\n'save$'\n' |
gpg --passphrase "$PASSPHRASE" --expert --batch --display-charset utf-8 \
  --command-fd 0 --edit-key craig@barkingiguana.com

# Turn the key-pair into a laptop key-pair
SUBKEYS_STORE="$GNUPGHOME/subkeys.bak"
# Delete the master signing key
gpg --export-secret-subkeys craig@barkingiguana.com > "$SUBKEYS_STORE"
echo yes$'\n'yes$'\n' | gpg --expert --batch --display-charset utf-8 \
  --command-fd 0 --delete-secret-key "$FINGERPRINT"

# Reimport subkeys
gpg --import "$SUBKEYS_STORE"
rm "$SUBKEYS_STORE"

# Check removal worked
if ! gpg --list-secret-keys craig@barkingiguana.com | egrep '^sec#' >/dev/null; then
  echo "I couldn't remove the secret key, bailing"
  rm -rf "$GNUPGHOME"
  exit 4
fi

# Move the keyrings to thenormal locations
rsync -rat "${GNUPGHOME}/" "$DEFAULT_GNUPGHOME"

# Clean up
rm -rf "$GNUPGHOME"

# Fetch the SKS Keyserver CA
curl -o "${DEFAULT_GNUPGHOME}/sks-keyservers-ca.pem" https://sks-keyservers.net/sks-keyservers.netCA.pem
# Configure GnuPG to use the SKS pool
cat > "${DEFAULT_GNUPGHOME}/gpg.conf" <<EOF
keyserver hkps://hkps.pool.sks-keyservers.net
keyserver-options ca-cert-file=${DEFAULT_GNUPGHOME}/sks-keyservers-ca.pem
keyserver-options no-honor-keyserver-url
EOF

# Success!
echo "Your new laptop key-pair is in ${DEFAULT_GNUPGHOME}"
echo "You should now unmount the removable media and return it to a safe place."
exit 0
{% endhighlight %}

[0]: /2015/03/02/gnupg-caff-and-docker-for-great-justice
