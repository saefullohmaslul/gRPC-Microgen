import Generator from './generator'
import GeneratorServer from './generator/generator-server'
import GenerateApp from './generator/generator-app'
import GeneratorDatabase from './generator/generator-database'
import GeneratorLatency from './generator/generator-latency'
import GeneratorGraphql from './generator/generator-graphql'

const generatorServer = new GeneratorServer()
const generatorApp = new GenerateApp()
const generatorDatabase = new GeneratorDatabase()
const generatorLatency = new GeneratorLatency()
const generatorGraphql = new GeneratorGraphql()

const generator = new Generator(generatorServer, generatorApp, generatorDatabase, generatorLatency, generatorGraphql)

generator.generate()