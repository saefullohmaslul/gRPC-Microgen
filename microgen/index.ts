import cp from 'child_process'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import logger from './lib/debugger.lib'

import GeneratorServer from './generator-server'
import GeneratorApp from './generator-app'
import GeneratorDatabase from './generator-database'
import GeneratorLatency from './generator-latency'

const main = () => {
  try {
    if (!existsSync(join(__dirname, '..', 'src'))) mkdirSync(join(__dirname, '..', 'src'))

    cp.execSync(`chmod +x ${join(__dirname, '..', 'scripts', 'generate-protoc.sh')}`)
    cp.execSync(join(__dirname, '..', 'scripts', 'generate-protoc.sh'))

    const generatorServer = new GeneratorServer()
    generatorServer.createIndexServices()
    const generatorApp = new GeneratorApp()
    generatorApp.generateApp()
    const generateDatabase = new GeneratorDatabase()
    generateDatabase.model()
  } catch (error) {
    console.log(error)
    logger.log(`Error: ${error}`)
  } finally {
    const generatorLatency = new GeneratorLatency()
    generatorLatency.deleteLatency()
  }
}

main()