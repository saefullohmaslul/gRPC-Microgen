import { parse } from 'graphql'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { IGraphqlSchema, IDefinition } from './interface/graphql-schema.interface'
import { SCHEMA_PATH, PROTOS_PATH } from './global/constant'

const graphqlFile = readFileSync(join(SCHEMA_PATH, 'schema.graphql')).toString()
const graphqlParser: IGraphqlSchema = parse(graphqlFile) as IGraphqlSchema

const primitiveTypes = ['String', 'Number', 'Float', 'Double', 'Int', 'Boolean']

graphqlParser.definitions.map((definition: IDefinition) => {
  let content: string = ''
  const serviceName = definition.name.value

  content += `syntax = "proto3";\n\n`
  content += `package ${serviceName.toLowerCase()};\n\n`
  content += `service ${serviceName}Service {\n`
  content += `  rpc show(${serviceName}Id) returns(${serviceName}) {}\n`
  content += `  rpc store(New${serviceName}) returns(${serviceName}) {}\n`
  content += `  rpc index(Blank) returns (${serviceName}s) {}\n`
  content += `  rpc delete(${serviceName}Id) returns(Result) {}\n`
  content += `  rpc update(${serviceName}) returns(${serviceName}) {}\n`
  content += `}\n\n`
  content += `message ${serviceName}Id {\n`
  content += `  string id = 1;\n`
  content += `}\n\n`
  content += `message ${serviceName} {\n`
  content += `  string id = 1;\n`
  definition.fields.map((field, index) => {
    if (field.type.name && primitiveTypes.includes(field.type.name.value)) {
      content += `  ${field.type.name.value.toLowerCase()} ${field.name.value} = ${index + 2};\n`
    } else if (field.type.name) {
      content += `  string ${field.name.value}Id = ${index + 2};\n`
    } else {
      console.log(field.type)
      // content += `  ${field.type.type.name.value.toLowerCase()} ${field.name.value} = ${index + 2};\n`
    }
  })
  content += `}\n\n`
  content += `message New${serviceName} {\n`
  definition.fields.map((field, index) => {
    if (field.type.name && primitiveTypes.includes(field.type.name.value)) {
      content += `  ${field.type.name.value.toLowerCase()} ${field.name.value} = ${index + 1};\n`
    } else if (field.type.name) {
      content += `  string ${field.name.value}Id = ${index + 1};\n`
    } else {
      // content += `  ${field.type.type.name.value.toLowerCase()} ${field.name.value} = ${index + 1};\n`
    }
  })
  content += `}\n\n`
  content += `message Result {\n`
  content += `  bool status = 1;\n`
  content += `}\n`
  content += `\n`
  content += `message Blank {}\n`
  content += `\n`
  content += `message ${serviceName}s {\n`
  content += `  repeated ${serviceName} ${serviceName.toLowerCase()}s = 1;\n`
  content += `}`

  if (!existsSync(PROTOS_PATH)) {
    mkdirSync(PROTOS_PATH)
  }
  writeFileSync(join(PROTOS_PATH, `${serviceName.toLowerCase()}.proto`), content)
})
