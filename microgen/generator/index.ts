import { existsSync, mkdirSync } from 'fs'

import logger from '../lib/debugger.lib'
import GeneratorServer from './generator-server'
import GeneratorApp from './generator-app'
import GeneratorDatabase from './generator-database'
import GeneratorLatency from './generator-latency'
import GeneratorGraphql from './generator-graphql'
import { generateProto } from '../../scripts/generate-protoc'
import { SRC_PATH } from '../global/constant'

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
    if (!existsSync(SRC_PATH)) mkdirSync(SRC_PATH)

    generateProto()
  }

  public proto() {
    this.generatorGraphql.createProto()
    this.generateProtoType()
  }

  public generate() {
    try {
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