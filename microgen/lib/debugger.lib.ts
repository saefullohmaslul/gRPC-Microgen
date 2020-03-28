import debug from 'debug'

const logger = {
  log: (message: string) => debug('server:log')(message),
  error: (message: string) => debug('server:error')(message)
}

export default logger