import debug from 'debug'

const logger = {
  log: (message: string) => debug('server:log')(message),
  app: (message: string) => debug('server:app')(message),
  db: (message: string) => debug('server:db')(message)
}

export default logger