import mongoose from 'mongoose'
import config from '@app/app/config'
import { injectable } from 'inversify'
import { logger } from '@app/app/lib'

@injectable()
export default class MongoConnection {
  private url: string
  constructor() {
    this.url = config.db.uri as string
  }
  public async  createConnection() {
    await mongoose
      .connect(
        config.db.uri as string,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true,
          user: config.db.user as string,
          pass: config.db.pass as string
        }
      )
    logger.db(`Database Up!`)
  }
}