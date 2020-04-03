import { existsSync, mkdirSync, readdirSync } from 'fs'
import { join } from 'path'
import cp from 'child_process'

import { ROOT_DIR } from '../microgen/global/constant'

const PROTO_DEST = join(ROOT_DIR, 'src', 'proto')

export const generateProto = () => {
  if (!existsSync(join(ROOT_DIR, 'src'))) {
    mkdirSync(join(ROOT_DIR, 'src'))
  }
  if (!existsSync(PROTO_DEST)) {
    mkdirSync(PROTO_DEST)
  }

  const files = readdirSync(join(ROOT_DIR, 'schema'))

  files.map(file => {
    const FILE = file.split('.proto').join('')

    if (!existsSync(join(PROTO_DEST, `${FILE}`))) {
      mkdirSync(join(PROTO_DEST, `${FILE}`))
    }

    cp.execSync(`protoc-gen-grpc \
    --js_out=import_style=commonjs,binary:${PROTO_DEST}/${FILE} \
    --grpc_out=${PROTO_DEST}/${FILE} \
    --proto_path ./schema \
    ${file}`)

    cp.execSync(`protoc-gen-grpc-ts \
    --ts_out=service=true:${PROTO_DEST}/${FILE} \
    --proto_path ./schema \
    ${file}`)
  })
}