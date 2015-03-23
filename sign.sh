#! /bin/bash

set -e

cp hooks/pre-commit .git/hooks/pre-commit

GPG="gpg --batch --yes --local-user craig@barkingiguana.com --armor"
find _posts -type f -name "*.md" -or -name "*.html" | while read FILE; do
  cp $FILE $FILE.unprocessed
  $GPG --output $FILE.asc --detach-sig $FILE
done

cp verification.md verification.md.unprocessed
$GPG --output verification.md.asc --detach-sig verification.md
