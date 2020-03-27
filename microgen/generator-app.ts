import { copySync, writeFileSync } from 'fs-extra'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { SRC_PATH } from './global/constant'
import GeneratorServer from './generator-server'
import capitalize from 'capitalize'
import { IProtoSchema } from './interface/proto-schema.interface'

export default class GenerateApp {
  private schemaParsed: IProtoSchema[]

  constructor() {
    this.schemaParsed = new GeneratorServer().schemaParsed()
  }

  private copyFile() {
    if (!existsSync(join(SRC_PATH, 'utils'))) {
      mkdirSync(join(SRC_PATH, 'utils'))
      mkdirSync(join(SRC_PATH, 'utils', 'dependency-injection'))
    }
    if (!existsSync(join(SRC_PATH, 'app'))) {
      mkdirSync(join(SRC_PATH, 'app'))
      mkdirSync(join(SRC_PATH, 'app', 'server'))
      mkdirSync(join(SRC_PATH, 'app', 'config'))
    }

    copySync(join(__dirname, 'src'), join(__dirname, '..', 'src'))
  }

  private createDI() {
    let content = ''
    content += `import { Container } from 'inversify'\n`
    content += `import Application from '@app/app/server/application'\n`
    content += `import MongoConnection from '@app/database/connection.database'\n\n`
    content += `const container = new Container()\n\n`
    content += `container.bind<Application>(Application).toSelf()\n`
    content += `container.bind<MongoConnection>(MongoConnection).toSelf()\n\n`
    this.schemaParsed.map(parser => {
      const packageName = parser.package
      const serviceName = capitalize(packageName)
      content += `import Grpc${serviceName}Service from '@app/grpc/${packageName}/${packageName}-service'\n`
      content += `container.bind<Grpc${serviceName}Service>(Grpc${serviceName}Service).toSelf()\n\n`

    })
    content += `export default container\n`

    writeFileSync(join(SRC_PATH, 'utils', 'dependency-injection', 'index.ts'), content)
  }

  private createApplication() {
    let content = ''
    content += `import { inject, injectable } from 'inversify'\n`
    content += `import MongoConnection from '@app/database/connection.database'\n\n`
    content += `@injectable()\n`
    content += `export default class Application {\n`
    content += `  private mongoConnection: MongoConnection\n`
    content += `  constructor(\n`
    content += `    @inject(MongoConnection) mongoConnection: MongoConnection\n`
    content += `  ) {\n`
    content += `    this.mongoConnection = mongoConnection\n`
    content += `  }\n\n`
    content += `  public async initialize() {\n`
    content += `    await this.mongoConnection.createConnection()\n`
    content += `  }\n`
    content += `}\n`

    writeFileSync(join(SRC_PATH, 'app', 'server', 'application.ts'), content)
  }

  private createIndex() {
    let content = ''
    content += `import 'module-alias/register'\n`
    content += `import 'reflect-metadata'\n`
    content += `import Application from '@app/app/server/application'\n`
    content += `import container from '@app/utils/dependency-injection'\n\n`
    content += `const application: Application = container.resolve(Application)\n`
    content += `application.initialize()\n\n`
    this.schemaParsed.map(parser => {
      const packageName = parser.package
      const serviceName = capitalize(packageName)
      content += `import gRPC${serviceName}Server from '@app/grpc/${packageName}'\n`
      content += `const grpc${serviceName}Server: gRPC${serviceName}Server = container.resolve(gRPC${serviceName}Server)\n`
      content += `grpc${serviceName}Server.initialize()\n\n`
    })


    writeFileSync(join(SRC_PATH, 'index.ts'), content)
  }

  public generateApp() {
    this.copyFile()
    this.createDI()
    this.createApplication()
    this.createIndex()
  }
}