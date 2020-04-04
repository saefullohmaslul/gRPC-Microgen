import capitalize from 'capitalize'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { singular } from 'pluralize'

import { protoParser } from '../lib/proto-parser.lib'
import { IProtoParser } from '../global/interface/proto-parser.interface'
import { SRC_PATH, PROTOS_PATH } from '../global/constant'
import { IProtoSchema } from '../global/interface/proto-schema.interface'
import config from '../config'

export default class GeneratorServer {
  private schemaDirectory: string
  private protoParser: (dirname: string) => IProtoParser

  constructor() {
    this.schemaDirectory = PROTOS_PATH
    this.protoParser = protoParser
  }

  private schema(): Buffer[] {
    return this.protoParser(this.schemaDirectory).schemas
  }

  public schemaParsed() {
    if (!existsSync(this.schemaDirectory)) {
      mkdirSync(this.schemaDirectory)
    }
    return this.protoParser(this.schemaDirectory).parsers
  }

  private createGrpcFolder() {
    if (!existsSync(join(SRC_PATH, 'grpc'))) {
      mkdirSync(join(SRC_PATH, 'grpc'))
    }

    if (!existsSync(join(SRC_PATH, 'grpc', 'server'))) {
      mkdirSync(join(SRC_PATH, 'grpc', 'server'))
    }

    if (!existsSync(join(SRC_PATH, 'grpc', 'client'))) {
      mkdirSync(join(SRC_PATH, 'grpc', 'client'))
    }
  }

  private createServiceFolder() {
    this.createGrpcFolder()
    this.schemaParsed().map(parser => {
      if (!existsSync(join(SRC_PATH, 'grpc', 'server', parser.package))) {
        mkdirSync(join(SRC_PATH, 'grpc', 'server', parser.package))
      }
    })
  }

  public createClassServices() {
    this.createServiceFolder()
    this.schemaParsed().map(parser => {
      const packageName = parser.package
      const serviceName = capitalize(packageName)
      const service = `${serviceName}Service`
      const methods = parser.services.filter(val => val.name === service)[0].methods
      let content: string

      content = `import grpc from 'grpc'\n\n`
      content += `import { `
      parser.messages.map((message, index) => {
        content += index === parser.messages.length - 1 ? `${message.name} ` : `${message.name}, `
      })
      content += `} from '@app/grpc/proto/${parser.package}/${parser.package}_pb'\n`
      content += `import ${serviceName}Repository from '@app/repositories/${packageName}.repository'\n`
      content += `import { injectable, inject } from 'inversify'\n\n`
      content += `@injectable()\n`
      content += `export default class Grpc${service} {\n`
      content += `  private ${packageName}Repository: ${serviceName}Repository\n`
      content += `  constructor(\n`
      content += `    @inject(${serviceName}Repository) ${packageName}Repository: ${serviceName}Repository\n`
      content += `  ) {\n`
      content += `    this.${packageName}Repository = ${packageName}Repository\n`
      content += `  }\n\n`
      methods.map((method, index) => {
        const fields = parser.messages.filter(val => val.name === method.output_type)[0].fields

        content += `  public async ${method.name}(\n`
        content += `    ${method.name === 'index' ? '_' : 'call'}: grpc.ServerUnaryCall<${method.input_type}>,\n`
        content += `    cb: grpc.sendUnaryData<${method.output_type}>\n`
        content += `  ) {\n`
        content += `    try {\n`
        if (method.name === 'show') {
          content += `      const id = call.request.getId()\n`
          content += `      const data = await this.${packageName}Repository.findById(id)\n\n`
          content += `      const ${method.output_type.toLowerCase()} = new ${method.output_type}()\n`
          fields.map(field => {
            content += `      ${method.output_type.toLowerCase()}.set${capitalize(field.name)}(data!.${field.name === 'id' ? '_id' : field.name})\n`
          })
          content += `\n      cb(null, ${method.output_type.toLowerCase()})\n`
        } else if (method.name === 'store') {
          const storeFields = parser.messages.filter(val => val.name === method.input_type)[0].fields
          storeFields.map(field => {
            content += `      const ${field.name} = call.request.get${capitalize(field.name)}()\n`
          })
          content += `\n      const data = await this.${packageName}Repository.create({\n`
          storeFields.map(field => {
            content += `        ${field.name},\n`
          })
          content += `      })\n\n`
          content += `      const ${method.output_type.toLowerCase()} = new ${method.output_type}()\n`
          fields.map(field => {
            content += `      ${method.output_type.toLowerCase()}.set${capitalize(field.name)}`
            switch (field.name) {
              case 'status':
                content += `(true)\n`
                break
              case 'id':
                content += `(data!._id)\n`
                break
              default:
                content += `(${`data!.${field.name}`})\n`
                break
            }
          })
          content += `\n      cb(null, ${method.output_type.toLowerCase()})\n`
        } else if (method.name === 'index') {
          content += `      const data = await this.${packageName}Repository.find()\n\n`
          content += `      const ${method.output_type.toLowerCase()} = new ${method.output_type}()\n`
          content += `      ${method.output_type.toLowerCase()}.set${method.output_type}List(data as ${singular(method.output_type)}[])\n`
          content += `\n      cb(null, ${method.output_type.toLowerCase()})\n`
        } else if (method.name === 'delete') {
          content += `      const id = call.request.getId()\n`
          content += `      await this.${packageName}Repository.delete({\n`
          content += `        _id: id\n`
          content += `      })\n\n`
          content += `      const ${method.output_type.toLowerCase()} = new ${method.output_type}()\n`
          fields.map(field => {
            content += `      ${method.output_type.toLowerCase()}.set${capitalize(field.name)}(${field.name === 'status' ? true : ''})\n`
          })
          content += `\n      cb(null, ${method.output_type.toLowerCase()})\n`
        } else {
          fields.map(field => {
            content += `      const ${field.name} = call.request.get${capitalize(field.name)}()\n`
          })
          content += `      const data = await this.${packageName}Repository.update({\n`
          content += `        _id: id\n`
          content += `      }, {\n`
          fields.map(field => {
            content += `        ${field.name},\n`
          })
          content += `      })\n\n`
          content += `      const ${method.output_type.toLowerCase()} = new ${method.output_type}()\n`
          fields.map(field => {
            content += `      ${method.output_type.toLowerCase()}.set${capitalize(field.name)}(${field.name === 'id' ? 'data!._id' : `data!.${field.name}`})\n`
          })
          content += `\n      cb(null, ${method.output_type.toLowerCase()})\n`
        }
        content += `    } catch (error) {\n`
        content += `      cb(error, null)\n`
        content += `    }\n`
        content += index === methods.length - 1 ? `  }\n` : `  }\n\n`
      })
      content += `}`

      writeFileSync(join(SRC_PATH, 'grpc', 'server', parser.package, `${parser.package}-service.ts`), content)
    })
  }

  public createIndexServices() {
    let portStart = config.PORT_START
    this.createClassServices()
    this.schemaParsed().map((parser: IProtoSchema) => {
      let content = ''
      const packageName = parser.package
      const serviceName = capitalize(parser.package)
      const service = `${serviceName}Service`
      portStart += 1

      content += `import grpc from 'grpc'\n`
      content += `import { injectable, inject } from 'inversify'\n\n`
      content += `import { logger } from '@app/app/lib'\n`
      content += `import { ${serviceName}ServiceService } from '@app/grpc/proto/${packageName}/${packageName}_grpc_pb'\n`
      content += `import ${service} from '@app/grpc/server/${packageName}/${packageName}-service'\n\n`
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
      content += `    this.server.bind('0.0.0.0:${portStart}', grpc.ServerCredentials.createInsecure())\n`
      content += `    this.server.start()\n`
      content += `    logger.log('gRPC ${service} started, listening: localhost:${portStart}')\n`
      content += `  }\n`
      content += `}\n`

      writeFileSync(join(SRC_PATH, 'grpc', 'server', packageName, `index.ts`), content)
    })
  }
}