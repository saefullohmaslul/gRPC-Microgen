import cp from 'child_process'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

import logger from './lib/debugger.lib'
import GeneratorServer from './generator-server'
import GeneratorApp from './generator-app'
import GeneratorDatabase from './generator-database'
import GeneratorLatency from './generator-latency'
import GeneratorGraphql from './generator-graphql'

export default class Generator {
  private generatorServer: GeneratorServer
  private generatorApp: GeneratorApp
  private generatorDatabase: GeneratorDatabase
  private generatorLatency: GeneratorLatency
  private generatorGraphql: GeneratorGraphql

  constructor(
    generatorServer: GeneratorServer,
    generatorApp: GeneratorApp,
    generatorDatabase: GeneratorDatabase,
    generatorLatency: GeneratorLatency,
    generatorGraphql: GeneratorGraphql
  ) {
    this.generatorServer = generatorServer
    this.generatorApp = generatorApp
    this.generatorDatabase = generatorDatabase
    this.generatorLatency = generatorLatency
    this.generatorGraphql = generatorGraphql
  }

  private generateProtoType() {
    if (!existsSync(join(__dirname, '..', 'src'))) mkdirSync(join(__dirname, '..', 'src'))

    cp.execSync(`chmod +x ${join(__dirname, '..', 'scripts', 'generate-protoc.sh')}`)
    cp.execSync(join(__dirname, '..', 'scripts', 'generate-protoc.sh'))
  }

  public generate() {
    try {
      this.generatorGraphql.createProto()
      this.generateProtoType()
      this.generatorServer.createIndexServices()
      this.generatorApp.generateApp()
      this.generatorDatabase.model()
      this.generatorGraphql.createGraphqlServer()
    } catch (error) {
      logger.error(error)
    } finally {
      this.generatorLatency.deleteLatency()
    }
  }
}