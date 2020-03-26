import cp from 'child_process'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import logger from './lib/debugger.lib'

import Generator from './generator'

const main = () => {
  try {
    if (!existsSync(join(__dirname, '..', 'src'))) mkdirSync(join(__dirname, '..', 'src'))

    cp.exec(`chmod +x ${join(__dirname, '..', 'scripts', 'generate-protoc.sh')}`)
    cp.exec(join(__dirname, '..', 'scripts', 'generate-protoc.sh'))

    const generator = new Generator()
    generator.createClassServices()
  } catch (error) {
    logger.log(`Error: ${error}`)
  }
}

main()