import mongoose from 'mongoose'
import config from '@app/app/config'
import { injectable } from 'inversify'

@injectable()
export default class MongoConnection {
  private url: string = config.db.uri as string
  public createConnection() {
    return mongoose
      .connect(
        this.url,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true
        }
      )
  }
}