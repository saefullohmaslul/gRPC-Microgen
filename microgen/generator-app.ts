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

    if (!existsSync(join(SRC_PATH, 'repositories'))) {
      mkdirSync(join(SRC_PATH, 'repositories'))
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

  private createRepository() {
    let content = ''
    content += `import { Model, FilterQuery, DocumentQuery, Document } from 'mongoose'\n`
    content += `import { injectable, decorate, unmanaged } from 'inversify'\n\n`
    content += `decorate(injectable(), Model)\n`
    content += `@injectable()\n`
    content += `export default class Repository<T extends Document> {\n`
    content += `  model: Model<T>\n`
    content += `  constructor(@unmanaged() model: Model<T>) {\n`
    content += `    this.model = model\n`
    content += `  }\n\n`
    content += `  async create(data: any): Promise<T> {\n`
    content += `    return this.model.create(data)\n`
    content += `  }\n\n`
    content += `  async update(condition: FilterQuery<T>, data: any): Promise<T | null> {\n`
    content += `    return this.model.findOneAndUpdate(condition, data, { new: true })\n`
    content += `  }\n\n`
    content += `  async delete(condition: FilterQuery<T>) {\n`
    content += `    return (await this.model.deleteOne(condition)).deletedCount\n`
    content += `  }\n\n`
    content += `  async find(param?: FilterQuery<T>): Promise<T[] | []> {\n`
    content += `    if (param) return this.model.find(param)\n`
    content += `    else return this.model.find()\n`
    content += `  }\n\n`
    content += `  async findOne(param: FilterQuery<T>): Promise<T | null> {\n`
    content += `    return this.model.findOne(param)\n`
    content += `  }\n\n`
    content += `  async findById(id: string): Promise<T | null> {\n`
    content += `    return this.model.findById(id)\n`
    content += `  }\n`
    content += `}\n`

    writeFileSync(join(SRC_PATH, 'repositories', 'repository.ts'), content)
  }

  private createModelExported() {
    let content = ''
    this.schemaParsed.map(parser => {
      const packageName = parser.package
      const serviceName = capitalize(packageName)
      content += `import ${serviceName}Model, { I${serviceName}, ${serviceName}Type } from './models/${packageName}.model'\n`
    })
    content += `export {\n`
    this.schemaParsed.map(parser => {
      const packageName = parser.package
      const serviceName = capitalize(packageName)
      content += `${serviceName}Model,\n`
      content += `I${serviceName},\n`
      content += `${serviceName}Type,\n`
    })
    content += `}`

    writeFileSync(join(SRC_PATH, 'database', `index.ts`), content)
  }

  private createIndividualRepository() {
    this.createRepository()
    this.schemaParsed.map(parser => {
      let content = ''
      const packageName = parser.package
      const serviceName = capitalize(packageName)

      content += `import Repository from './repository'\n`
      content += `import { ${serviceName}Model, ${serviceName}Type } from '@app/database'\n\n`
      content += `export default class ${serviceName}Repository extends Repository<${serviceName}Type> {\n`
      content += `  public model = ${serviceName}Model\n`
      content += `}\n`

      writeFileSync(join(SRC_PATH, 'repositories', `${packageName}.repository.ts`), content)
    })

  }

  public generateApp() {
    this.copyFile()
    this.createDI()
    this.createApplication()
    this.createIndex()
    this.createModelExported()
    this.createIndividualRepository()
  }
}