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
    let contentGraphql: string = ''
    let contentResolver: string = ''
    let contentSchema: string = ''
    contentGraphql += `type Query {\n`
    contentGraphql += `  helloWorld: String!\n`
    contentGraphql += `}`

    contentResolver += `import { IResolvers } from 'graphql-tools'\n\n`
    contentResolver += `const userResolver: IResolvers = {\n`
    contentResolver += `  Query: {\n`
    contentResolver += `    helloWorld(_: void, args: void): string {\n`
    contentResolver += `      return 'Hello World'\n`
    contentResolver += `    }\n`
    contentResolver += `  }\n`
    contentResolver += `}\n\n`
    contentResolver += `export default userResolver\n`

    contentSchema += `import 'graphql-import-node'\n`
    contentSchema += `import { makeExecutableSchema } from 'graphql-tools'\n`
    contentSchema += `import { GraphQLSchema } from 'graphql'\n\n`
    contentSchema += `import userType from './user/user.graphql'\n`
    contentSchema += `import userResolver from './user/user.resolver'\n\n`
    contentSchema += `const schema: GraphQLSchema = makeExecutableSchema({\n`
    contentSchema += `  typeDefs: [userType],\n`
    contentSchema += `  resolvers: [userResolver]\n`
    contentSchema += `})\n\n`
    contentSchema += `export default schema\n`

    if (!existsSync(join(SRC_PATH, 'app', 'graphql'))) {
      mkdirSync(join(SRC_PATH, 'app', 'graphql'))
    }

    if (!existsSync(join(SRC_PATH, 'app', 'graphql', 'user'))) {
      mkdirSync(join(SRC_PATH, 'app', 'graphql', 'user'))
    }

    writeFileSync(join(SRC_PATH, 'app', 'graphql', 'user', `user.graphql`), contentGraphql)
    writeFileSync(join(SRC_PATH, 'app', 'graphql', 'user', `user.resolver.ts`), contentResolver)
    writeFileSync(join(SRC_PATH, 'app', 'graphql', `schema.ts`), contentSchema)
  }
}