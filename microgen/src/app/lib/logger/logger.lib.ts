import debug from 'debug'

const logger = {
  log: (message: string) => debug('server:log')(message)
}

export default logger