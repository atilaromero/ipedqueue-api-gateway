#!/bin/bash
: ${1:?Use $0 DIR}

if [ ! -d "$1" ]
then
  echo ARG1 must be a directory
  exit 1
fi

cd "$1"
# shift
#
# if [ ! -d "$1" ]
# then
#   echo ARG2 must be a directory
#   exit 1
# fi
set -x

DVD=$(mktemp -d) || exit 1
trap "rm -rf $DVD" EXIT
stdbuf -o 0 find "$@" -name indexador -prune -o -name 'hashlog.*' -print0 -o -name 'Lista de Arquivos.csv' -print0 | xargs -L1 -0 sha256sum | tee "$1"/hashes.txt
find "$@" -name indexador -prune -o -name 'hashlog.*' -print0 -o -name 'Lista de Arquivos.csv' -print0 | xargs -0 tar c | tar x -C $DVD
mkisofs  -U -udf -iso-level 4 -allow-limited-size -f -o "$1"/DVD-anexo-laudo.iso "$1"/hashes.txt $DVD