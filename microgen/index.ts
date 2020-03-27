import cp from 'child_process'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import logger from './lib/debugger.lib'

import GeneratorServer from './generator-server'
import GeneratorApp from './generator-app'
import GeneratorDatabase from './generator-database'

const main = () => {
  try {
    if (!existsSync(join(__dirname, '..', 'src'))) mkdirSync(join(__dirname, '..', 'src'))

    cp.exec(`chmod +x ${join(__dirname, '..', 'scripts', 'generate-protoc.sh')}`)
    cp.exec(join(__dirname, '..', 'scripts', 'generate-protoc.sh'))

    const generatorServer = new GeneratorServer()
    generatorServer.createIndexServices()
    const generatorApp = new GeneratorApp()
    generatorApp.generateApp()
    const generateDatabase = new GeneratorDatabase()
    generateDatabase.model()
  } catch (error) {
    console.log(error)
    logger.log(`Error: ${error}`)
  }
}

main()