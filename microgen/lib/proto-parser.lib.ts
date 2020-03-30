import fs from 'fs'
import path from 'path'
const protoSchema = require('protocol-buffers-schema')

import { IProtoSchema } from '../global/interface/proto-schema.interface'

export const protoParser = (dirname: string): {
  parsers: IProtoSchema[],
  schemas: Buffer[]
} => {
  dirname = dirname
  const parsers: IProtoSchema[] = []
  const schemas: Buffer[] = []

  const protoFiles = fs.readdirSync(dirname)

  protoFiles.map((protoFile: string) => {
    const file = path.join(dirname, protoFile)
    const schema = fs.readFileSync(file)
    const parser: IProtoSchema = protoSchema.parse(schema)

    parsers.push(parser)
    schemas.push(schema)
  })

  return {
    parsers,
    schemas
  }
}
