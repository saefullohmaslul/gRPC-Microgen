#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
cd ${BASEDIR}/../

PROTO_DEST=./src/proto

mkdir -p ${PROTO_DEST}

for file in ./schema/*.proto
do
  FILE="$(basename -s .proto $file)"
  
  mkdir -p ./src/proto/$FILE
  
  npx protoc-gen-grpc \
  --js_out=import_style=commonjs,binary:${PROTO_DEST}/${FILE} \
  --grpc_out=${PROTO_DEST}/${FILE} \
  --proto_path ./schema \
  $file

  npx protoc-gen-grpc-ts \
  --ts_out=service=true:${PROTO_DEST}/${FILE} \
  --proto_path ./schema \
  $file

done

echo "Success generated proto file"