#! /bin/bash

set -e

cp hooks/pre-commit .git/hooks/pre-commit

GPG="gpg --batch --yes --local-user craig@barkingiguana.com --armor"
find _posts -type f -name "*.md" -or -name "*.html" | sed 's/_posts\///' | while read FILE; do
  DIR=$(echo ${FILE:0:10} |sed 's/-/\//' |sed 's/-/\//')
  test -d $DIR || mkdir -p $DIR
  TARGET="${FILE:11}.orig"
  perl -ne '$i > 1 ? print : /^---/ && $i++' _posts/$FILE > $DIR/$TARGET
  if [ -f "$DIR/$TARGET.asc" ]; then
    $GPG --verify $DIR/$TARGET{.asc,} >/dev/null 2>/dev/null || \
      $GPG --output $DIR/$TARGET.asc --detach-sig $DIR/$TARGET
  else
    $GPG --output $DIR/$TARGET.asc --detach-sig $DIR/$TARGET
  fi
done

if [ -f verification.md.asc ]; then
  $GPG --verify verification.md{.asc,} >/dev/null 2>/dev/null || \
    $GPG --output verification.md.asc --detach-sig verification.md
else
  $GPG --output verification.md.asc --detach-sig verification.md
fi
