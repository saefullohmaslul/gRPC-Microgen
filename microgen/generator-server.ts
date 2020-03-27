import capitalize from 'capitalize'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

import { protoParser } from './lib/proto-parser.lib'
import { IProtoParser } from './interface/proto-parser.interface'
import { SRC_PATH } from './global/constant'
import { IProtoSchema } from './interface/proto-schema.interface'

export default class GeneratorServer {
  private schemaDirectory: string
  private protoParser: (dirname: string) => IProtoParser

  constructor() {
    this.schemaDirectory = join(__dirname, '..', 'schema')
    this.protoParser = protoParser
  }

  private schema(): Buffer[] {
    return this.protoParser(this.schemaDirectory).schemas
  }

  public schemaParsed() {
    return this.protoParser(this.schemaDirectory).parsers
  }

  private createGrpcFolder() {
    if (!existsSync(join(SRC_PATH, 'grpc'))) {
      mkdirSync(join(SRC_PATH, 'grpc'))
    }
  }

  private createServiceFolder() {
    this.createGrpcFolder()
    this.schemaParsed().map(parser => {
      if (!existsSync(join(SRC_PATH, 'grpc', parser.package))) {
        mkdirSync(join(SRC_PATH, 'grpc', parser.package))
      }
    })
  }

  public createClassServices() {
    this.createServiceFolder()
    this.schemaParsed().map(parser => {
      const service = `${capitalize(parser.package)}Service`
      const methods = parser.services.filter(val => val.name === service)[0].methods
      let content: string

      content = `import grpc from 'grpc'\n\n`
      content += `import { `
      parser.messages.map((message, index) => {
        content += index === parser.messages.length - 1 ? `${message.name} ` : `${message.name}, `
      })
      content += `} from '@app/proto/${parser.package}/${parser.package}_pb'\n`
      content += `import { injectable } from 'inversify'\n\n`
      content += `@injectable()\n`
      content += `export default class Grpc${capitalize(parser.package)}Service {\n`
      methods.map((method, index) => {
        const fields = parser.messages.filter(val => val.name === method.output_type)[0].fields

        content += `  public ${method.name}(\n`
        content += `    call: grpc.ServerUnaryCall<${method.input_type}>,\n`
        content += `    cb: grpc.sendUnaryData<${method.output_type}>\n`
        content += `  ) {\n`
        content += `    try {\n`
        content += `      const ${method.output_type.toLowerCase()} = new ${method.output_type}()\n\n`
        fields.map(field => {
          content += `      ${method.output_type.toLowerCase()}.set${capitalize(field.name)}()\n`
        })
        content += `\n      cb(null, ${method.output_type.toLowerCase()})\n`
        content += `    } catch (error) {\n`
        content += `      cb(error, null)\n`
        content += `    }\n`
        content += index === methods.length - 1 ? `  }\n` : `  }\n\n`
      })
      content += `}`

      writeFileSync(join(SRC_PATH, 'grpc', parser.package, `${parser.package}-service.ts`), content)
    })
  }

  public createIndexServices() {
    this.createClassServices()
    this.schemaParsed().map((parser: IProtoSchema) => {
      let content = ''
      const packageName = parser.package
      const serviceName = capitalize(parser.package)
      const service = `${serviceName}Service`

      content += `import grpc from 'grpc'\n`
      content += `import { injectable, inject } from 'inversify'\n\n`
      content += `import { logger } from '@app/app/lib'\n`
      content += `import { ${serviceName}ServiceService } from '@app/proto/${packageName}/${packageName}_grpc_pb'\n`
      content += `import ${service} from '@app/grpc/${packageName}/${packageName}-service'\n\n`
      content += `@injectable()\n`
      content += `export default class gRPC${serviceName}Server {\n`
      content += `  private server: grpc.Server\n\n`
      content += `  constructor(\n`
      content += `    @inject(${service}) gRPC${service}: ${service}\n`
      content += `  ) {\n`
      content += `    this.server = new grpc.Server()\n`
      content += `    this.server.addService(${service}Service, gRPC${service})\n`
      content += `  }\n\n`
      content += `  public initialize() {\n`
      content += `    this.server.bind('0.0.0.0:3001', grpc.ServerCredentials.createInsecure())\n`
      content += `    this.server.start()\n`
      content += `    logger.log('gRPC ${service} started, listening: localhost:3001')\n`
      content += `  }\n`
      content += `}\n`

      writeFileSync(join(SRC_PATH, 'grpc', packageName, `index.ts`), content)
    })
  }
}