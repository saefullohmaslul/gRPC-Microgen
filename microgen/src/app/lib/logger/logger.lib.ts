import debug from 'debug'

const logger = {
  log: (message: string) => debug('server:log')(message),
  app: (message: string) => debug('server:app')(message)
}

export default logger