import Generator from './generator'
import GeneratorServer from './generator-server'
import GenerateApp from './generator-app'
import GeneratorDatabase from './generator-database'
import GeneratorLatency from './generator-latency'
import GeneratorGraphql from './generator-graphql'

const generatorServer = new GeneratorServer()
const generatorApp = new GenerateApp()
const generatorDatabase = new GeneratorDatabase()
const generatorLatency = new GeneratorLatency()
const generatorGraphql = new GeneratorGraphql()

const generator = new Generator(generatorServer, generatorApp, generatorDatabase, generatorLatency, generatorGraphql)

generator.generate()