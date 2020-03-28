import { readFileSync, writeFileSync } from "fs-extra"
import { join } from 'path'
import capitalize from 'capitalize'

import GeneratorServer from "./generator-server"

export default class GeneratorDatabase {
  private generatorServer: GeneratorServer
  constructor() {
    this.generatorServer = new GeneratorServer()
  }

  model() {
    this.generatorServer.schemaParsed().map(parser => {
      const model = readFileSync(join(__dirname, 'example', 'models', 'example.model.ts'))
      const fields = parser.messages.filter(val => val.name === capitalize(parser.package))[0]?.fields
      let interfaceFields: string = ''
      let schemaFields: string = ''

      fields.map((field, index) => {
        field.name === 'id' ? field.name = '_id' : null
        if (index === fields.length - 1) {
          interfaceFields += `  ${field.name}: ${field.type}`
          schemaFields += `  ${field.name}: { type: ${capitalize(field.type)} },`
        } else if (index === 0) {
          interfaceFields += `${field.name}: ${field.type}\n`
        } else if (index === 1) {
          interfaceFields += `  ${field.name}: ${field.type}\n`
          schemaFields += `${field.name}: { type: ${capitalize(field.type)} },\n`
        } else {
          interfaceFields += `  ${field.name}: ${field.type}\n`
          schemaFields += `  ${field.name}: { type: ${capitalize(field.type)} },\n`
        }
      })

      const generate = model
        .toString()
        .split('Example')
        .join(capitalize(parser.package))
        .replace('fields: string', interfaceFields)
        .replace('schema: String', schemaFields)

      writeFileSync(join(__dirname, '..', 'src', 'database', 'models', `${parser.package}.model.ts`), generate)
    })
  }
}