import { parse } from 'graphql'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { IGraphqlSchema, IDefinition } from '../global/interface/graphql-schema.interface'
import { SCHEMA_PATH, PROTOS_PATH, SRC_PATH } from '../global/constant'

export default class GeneratorGraphql {
  private graphqlParser: IGraphqlSchema
  private graphqlFile: string
  private primitiveTypes: string[]

  constructor() {
    this.graphqlFile = readFileSync(join(SCHEMA_PATH, 'schema.graphql')).toString()
    this.graphqlParser = parse(this.graphqlFile) as IGraphqlSchema
    this.primitiveTypes = ['String', 'Number', 'Float', 'Double', 'Int', 'Boolean']
  }

  public createProto() {
    this.graphqlParser.definitions.map((definition: IDefinition) => {
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
        if (field.type.name && this.primitiveTypes.includes(field.type.name.value)) {
          content += `  ${field.type.name.value.toLowerCase()} ${field.name.value} = ${index + 2};\n`
        } else if (field.type.name) {
          content += `  string ${field.name.value}Id = ${index + 2};\n`
        } else {
          // content += `  ${field.type.type.name.value.toLowerCase()} ${field.name.value} = ${index + 2};\n`
        }
      })
      content += `}\n\n`
      content += `message New${serviceName} {\n`
      definition.fields.map((field, index) => {
        if (field.type.name && this.primitiveTypes.includes(field.type.name.value)) {
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
  }

  public createGraphqlServer() {
    if (!existsSync(join(SRC_PATH, 'app', 'graphql'))) {
      mkdirSync(join(SRC_PATH, 'app', 'graphql'))
    }


    let contentSchema: string = ''
    this.graphqlParser.definitions.map((definition: IDefinition) => {
      const typeName = definition.name.value

      if (!existsSync(join(SRC_PATH, 'app', 'graphql', typeName.toLowerCase()))) {
        mkdirSync(join(SRC_PATH, 'app', 'graphql', typeName.toLowerCase()))
      }

      let contentResolver: string = ''
      let contentGraphql: string = ''
      contentGraphql += `type ${typeName} {\n`
      definition.fields.map(field => {
        contentGraphql += `  ${field.name.value}: ${field.type.name ? field.type.name.value : `[${field.type.type.name.value}]`}\n`
      })
      contentGraphql += `}\n\n`
      contentGraphql += `type Query {\n`
      contentGraphql += `  ${typeName.toLowerCase()}: ${typeName}\n`
      contentGraphql += `}\n`

      contentResolver += `import { IResolvers } from 'graphql-tools'\n\n`
      definition.fields.map(field => {
        if (field.type.name && !this.primitiveTypes.includes(field.type.name.value) || !field.type.name) {
          const check = field.type.name ? field.type.name.value : field.type.type.name.value
          contentResolver += `import { ${check} } from '../${check.toLowerCase()}/${check.toLowerCase()}.resolver'\n`
        }
      })
      contentResolver += `\nexport interface ${typeName} {\n`
      definition.fields.map(field => {
        contentResolver += `  ${field.name.value}?: ${field.type.name ? field.type.name.value : `${field.type.type.name.value}[]`}\n`
      })
      contentResolver += `}\n\n`
      contentResolver += `const ${typeName.toLowerCase()}Resolver: IResolvers = {\n`
      contentResolver += `  Query: {\n`
      contentResolver += `    ${typeName.toLowerCase()}: (_: void, args: void): ${typeName} => {\n`
      contentResolver += `      return {\n`
      contentResolver += `        email: 'email'\n`
      contentResolver += `      }\n`
      contentResolver += `    }\n`
      contentResolver += `  }\n`
      contentResolver += `}\n\n`
      contentResolver += `export default ${typeName.toLowerCase()}Resolver\n`

      writeFileSync(join(SRC_PATH, 'app', 'graphql', typeName.toLowerCase(), `${typeName.toLowerCase()}.graphql`), contentGraphql)
      writeFileSync(join(SRC_PATH, 'app', 'graphql', typeName.toLowerCase(), `${typeName.toLowerCase()}.resolver.ts`), contentResolver)
    })

    contentSchema += `import 'graphql-import-node'\n`
    contentSchema += `import { makeExecutableSchema } from 'graphql-tools'\n`
    contentSchema += `import { merge } from 'lodash'\n`
    contentSchema += `import { GraphQLSchema } from 'graphql'\n\n`
    contentSchema += `import typeDef from './schema.graphql'\n\n`
    this.graphqlParser.definitions.map((definition: IDefinition) => {
      const typeName = definition.name.value
      contentSchema += `import ${typeName.toLowerCase()}Type from './${typeName.toLowerCase()}/${typeName.toLowerCase()}.graphql'\n`
      contentSchema += `import ${typeName.toLowerCase()}Resolver from './${typeName.toLowerCase()}/${typeName.toLowerCase()}.resolver'\n\n`
    })
    contentSchema += `const schema: GraphQLSchema = makeExecutableSchema({\n`
    contentSchema += `  typeDefs: [\n`
    contentSchema += `    typeDef,\n`
    this.graphqlParser.definitions.map((definition: IDefinition) => {
      const typeName = definition.name.value
      contentSchema += `    ${typeName.toLowerCase()}Type,\n`
    })
    contentSchema += `  ],\n`
    contentSchema += `  resolvers: merge(\n`
    this.graphqlParser.definitions.map((definition: IDefinition) => {
      const typeName = definition.name.value
      contentSchema += `    ${typeName.toLowerCase()}Resolver,\n`
    })
    contentSchema += `  ),\n`
    contentSchema += `})\n\n`
    contentSchema += `export default schema\n`

    writeFileSync(join(SRC_PATH, 'app', 'graphql', `schema.ts`), contentSchema)

    let schemaGraphql = ''
    schemaGraphql += `type Query { default: String }`
    writeFileSync(join(SRC_PATH, 'app', 'graphql', `schema.graphql`), schemaGraphql)
  }
}