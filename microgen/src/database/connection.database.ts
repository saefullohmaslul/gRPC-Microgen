import mongoose from 'mongoose'
import config from '@app/app/config'
import { injectable } from 'inversify'
import { logger } from '@app/app/lib'

@injectable()
export default class MongoConnection {
  private url: string = config.db.uri as string
  public async  createConnection() {
    await mongoose
      .connect(
        this.url,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true
        }
      )
    logger.db(`Database Up!`)
  }
}